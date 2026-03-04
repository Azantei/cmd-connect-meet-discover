/* ==========================================
   C.M.D. - EVENT VIEW
   RSVP button toggle functionality
========================================== */

// Track RSVP state
var rsvpActive = false;

/**
 * Toggle RSVP status for the event
 * Updates button text and styling based on state
 */
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
