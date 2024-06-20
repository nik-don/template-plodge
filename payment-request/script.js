function generateText() {
    const name = document.getElementById('name').value;
    const reservationId = document.getElementById('reservationId').value;
    const checkinDate = document.getElementById('checkinDate').value;

    const formattedDate = formatDate(checkinDate);

    const text = `Dear ${name},
We have attempted to charge the bank card for your upcoming reservation at Palmers Lodge, as we require all reservations to be fully prepaid before arrival.
Reservation/OTA ID: ${reservationId} / Check-in date:  ${formattedDate}
Unfortunately, on this occasion, we were unable to charge the card that you provided.  Please note that guests must ensure that they have used a valid payment card, with the total amount available to cover the cost of any reservation.
We kindly ask you to please complete this payment request in the next 24 hours for the total amount of your reservation, so that we can secure your booking.
Please note that if we are unable to secure payment for your reservation, we'll be forced to cancel your booking.
Should you require any assistance with this matter, please feel free to contact us on 020774838470 or email palmers@palmerslodge.uk`;

    document.getElementById('outputText').value = text;
}

function copyText() {
    const outputText = document.getElementById('outputText');
    outputText.select();
    outputText.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
    alert('Text copied to clipboard');
}

function pasteText(fieldId) {
    navigator.clipboard.readText().then(text => {
        document.getElementById(fieldId).value = text;
    }).catch(err => {
        alert('Failed to read clipboard contents: ' + err);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function clearFields() {
    document.getElementById('name').value = '';
    document.getElementById('reservationId').value = '';
    document.getElementById('checkinDate').value = '';
    document.getElementById('outputText').value = '';
}
