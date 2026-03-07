/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - USER SETTINGS
   Settings page with interest selection and section switching
========================================== */

// All available interest categories
var ALL_INTERESTS = ["Outdoors", "Running", "Coffee", "Music", "Sports", "Food", "Arts", "Tech", "Fitness", "Games", "Photography", "Travel"];

// User's currently selected interests
var activeInterests = ["Outdoors", "Running", "Coffee", "Music"];

/**
 * Build and render interest selection pills
 * Dynamically creates pill buttons for all available interests
 */
var pillsWrap = document.getElementById('interestPills');
ALL_INTERESTS.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'pill' + (activeInterests.includes(cat) ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = function() {
        btn.classList.toggle('active');
    };
    pillsWrap.appendChild(btn);
});

/**
 * Switch between settings sections
 * Updates active nav item and displays selected section
 * @param {HTMLElement} el - The clicked nav item
 * @param {string} id - Section identifier (profile, account, privacy, notifications)
 */
function setSection(el, id) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.classList.remove('active');
    });
    el.classList.add('active');

    // Show section
    document.querySelectorAll('.section').forEach(function(s) { s.style.display = 'none'; });
    document.getElementById('section-' + id).style.display = 'block';
}

/**
 * Toggle a switch on/off
 * Generic toggler for settings switches
 * @param {HTMLElement} el - The toggle switch element
 */
function toggleSwitch(el) {
    el.classList.toggle('on');
}

/**
 * Toggle email notifications and show/hide nested options
 * When enabled, shows additional email notification sub-options
 * @param {HTMLElement} el - The toggle switch element
 */
function toggleEmailNotifications(el) {
    el.classList.toggle('on');
    var options = document.getElementById('emailNotificationOptions');
    if (el.classList.contains('on')) {
        options.style.display = 'block';
    } else {
        options.style.display = 'none';
    }
}

/**
 * Toggle nearby events and show/hide nested sub-options
 * @param {HTMLElement} el - The toggle switch element
 */
function toggleNearbyEvents(el) {
    el.classList.toggle('on');
    var options = document.getElementById('nearbyEventsOptions');
    if (el.classList.contains('on')) {
        options.style.display = 'block';
    } else {
        options.style.display = 'none';
    }
}

/**
 * Show success toast notification
 * Displays a temporary "Changes saved!" message at the bottom of the screen
 */
function showToast() {
    var toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(function() { toast.style.display = 'none'; }, 2500);
}
