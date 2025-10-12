(function () {
  const nameEl = document.getElementById('name');
  const resIdEl = document.getElementById('reservationId');
  const dateEl = document.getElementById('checkinDate');
  const typeEl = document.getElementById('messageType');
  const outputEl = document.getElementById('outputText');
  const autoNote = document.getElementById('autoNote');
  const generateBtn = document.getElementById('generateBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');

  // Track if user manually changed message type (so we don't keep auto-overriding)
  let userOverrodeType = false;

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function hoursUntil(dateString) {
    if (!dateString) return Infinity;
    const now = new Date();
    const checkin = new Date(dateString);
    if (!/T\d{2}:\d{2}/.test(dateString)) {
      checkin.setHours(12, 0, 0, 0); // assume midday local time
    }
    return (checkin - now) / 36e5;
  }

  function getTodayYYYYMMDD() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getUrgencySelection() {
    return document.querySelector('input[name="urgency"]:checked')?.value || null;
  }

  // New urgency-specific templates
  function buildUrgencyTemplates(name, resId, formattedDate) {
    const within24h = `Dear ${name},

We have attempted to charge the bank card provided for your upcoming reservation at Palmers Lodge, as all bookings must be fully prepaid before arrival.

Reservation/OTA ID: ${resId}
Check-in date: ${formattedDate}

Unfortunately, the payment was unsuccessful. Please ensure you use a valid payment card with sufficient funds and complete this payment request within 24 hours to secure your booking.

If payment is not received within this time, we will not be able to hold your reservation and it will be cancelled automatically.

If you need assistance, please call 020 7748 38470 or email palmers@palmerslodge.uk`;

    const within12h = `Dear ${name},

We have tried to charge the card provided for your upcoming reservation at Palmers Lodge, but the payment was unsuccessful.

Reservation/OTA ID: ${resId}
Check-in date: ${formattedDate}

Please complete this payment request within the next 12 hours to keep your booking active. We’re unable to hold unpaid reservations beyond this time, and the booking will be cancelled if payment isn’t received.

We look forward to welcoming you, so please make sure to finalise your payment as soon as possible.

If you need any help, call 020 7748 38470 or email palmers@palmerslodge.uk`;

    return { within24h, within12h };
  }

  // Existing templates (kept for manual use when no urgency is selected)
  function buildStandardTemplates(name, resId, formattedDate) {
    const baseHeader = `Dear ${name},`;
    const bookingLine = `Reservation/OTA ID: ${resId} / Check-in date: ${formattedDate}`;

    const first = `${baseHeader}
We have attempted to charge the bank card for your upcoming reservation at Palmers Lodge, as we require all reservations to be fully prepaid before arrival.

${bookingLine}

Unfortunately, we were unable to charge the card you provided. Guests must ensure that they have used a valid payment card, with sufficient funds to cover the total cost of the reservation.

We kindly ask you to complete this payment request within 24 hours so that we can secure your booking.

If we are unable to secure payment, we may have to cancel the booking.
If you need assistance, please call 020774838470 or email palmers@palmerslodge.uk.`;

    const second = `${baseHeader}
This is a friendly reminder and a successive attempt to take payment needed to secure your reservation at Palmers Lodge.

${bookingLine}

We were not able to charge the card on file in our previous attempt(s). Please complete the payment within 24 hours to avoid cancellation.

If you need help or an alternative payment method, call 020774838470 or email palmers@palmerslodge.uk.`;

    const final = `${baseHeader}
Final reminder - Action needed to keep your reservation at Palmers Lodge.

${bookingLine}

Please complete this payment request before it expires. After the expiry, we can no longer keep the reservation confirmed and, unfortunately, the booking will be cancelled.

If there is an issue with your card or any other support, call 020774838470 or email palmers@palmerslodge.uk.`;

    return { first, second, final };
  }

  function generateAndRender() {
    const name = nameEl.value.trim();
    const resId = resIdEl.value.trim();
    const dateVal = dateEl.value.trim();
    if (!resId || !dateVal) { outputEl.value = ''; return; }

    const formattedDate = formatDate(dateVal);

    // If urgency selected, use the new guest templates and ignore message type dropdown
    const urgency = getUrgencySelection();
    if (urgency === '12' || urgency === '24') {
      const { within24h, within12h } = buildUrgencyTemplates(name, resId, formattedDate);
      outputEl.value = urgency === '12' ? within12h : within24h;
      // Do not show or change auto note or message type when urgency is used
      autoNote.textContent = '';
      autoNote.style.display = 'none';
      return;
    }

    // Otherwise fall back to standard templates that use the Name field
    if (!name) { outputEl.value = ''; return; }
    const { first, second, final } = buildStandardTemplates(name, resId, formattedDate);
    const choice = typeEl.value;
    const text = choice === 'second' ? second : choice === 'final' ? final : first;
    outputEl.value = text;
  }

  // Event wiring
  document.addEventListener('click', (e) => {
    const pasteTarget = e.target.closest('[data-paste]');
    if (pasteTarget) {
      const id = pasteTarget.getAttribute('data-paste');
      navigator.clipboard.readText().then(t => {
        document.getElementById(id).value = t;
        generateAndRender();
      }).catch(err => alert('Failed to read clipboard contents: ' + err));
    }
  });

  // Live updates
  ['input', 'change'].forEach(evt => {
    nameEl.addEventListener(evt, generateAndRender);
    resIdEl.addEventListener(evt, generateAndRender);
    dateEl.addEventListener(evt, () => { userOverrodeType = false; generateAndRender(); });
    typeEl.addEventListener(evt, () => { userOverrodeType = true; generateAndRender(); });

    // When urgency is selected, set date to today and generate immediately
    document.querySelectorAll('input[name="urgency"]').forEach(r => r.addEventListener(evt, () => {
      dateEl.value = getTodayYYYYMMDD();
      userOverrodeType = false;
      generateAndRender();
    }));
  });

  // Buttons
  generateBtn.addEventListener('click', generateAndRender);
  clearBtn.addEventListener('click', () => {
    nameEl.value = '';
    resIdEl.value = '';
    dateEl.value = '';
    typeEl.value = 'first';
    document.querySelectorAll('input[name="urgency"]').forEach(r => r.checked = false);
    outputEl.value = '';
    autoNote.textContent = '';
    autoNote.style.display = 'none';
    userOverrodeType = false;
  });

  copyBtn.addEventListener('click', async () => {
    const output = outputEl.value;
    if (!output) { alert('Nothing to copy yet.'); return; }
    try { await navigator.clipboard.writeText(output); alert('Text copied to clipboard'); }
    catch (e) { outputEl.select(); outputEl.setSelectionRange(0, 99999); document.execCommand('copy'); alert('Text copied to clipboard'); }
  });

  // Initial
  // Do not preselect urgency or date; wait for user action
})();




