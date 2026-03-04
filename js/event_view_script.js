var rsvpActive = false;

function toggleRsvp() {
    rsvpActive = !rsvpActive;
    var btn = document.getElementById('rsvpBtn');
    if (rsvpActive) {
        btn.textContent = "✓ RSVP'd — You're Going!";
        btn.classList.add('active');
    } else {
        btn.textContent = "✓ RSVP — I'm Going!";
        btn.classList.remove('active');
    }
}
