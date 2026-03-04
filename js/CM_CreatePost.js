/* ==========================================
   C.M.D. - CREATE POST
   Post type toggle and form interaction logic
========================================== */

/**
 * Toggle between casual and formal post types
 * Shows/hides RSVP options for formal events
 * @param {string} type - Either 'casual' or 'formal'
 */
function setType(type) {
    document.getElementById('btn-casual').classList.remove('active');
    document.getElementById('btn-formal').classList.remove('active');
    document.getElementById('btn-' + type).classList.add('active');

    var rsvp = document.getElementById('rsvpWrapper');
    if (type === 'formal') {
        rsvp.classList.add('visible');
    } else {
        rsvp.classList.remove('visible');
    }
}

/**
 * Toggle category pill selection
 * Allows multiple categories to be selected
 * @param {HTMLElement} el - The clicked category pill element
 */
function toggleCat(el) {
    el.classList.toggle('active');
}

/**
 * Toggle RSVP required setting
 * Visual feedback for RSVP toggle button
 */
function toggleRsvp() {
    var toggle = document.getElementById('rsvpToggle');
    toggle.classList.toggle('on');
}
