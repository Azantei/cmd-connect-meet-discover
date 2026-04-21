/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - EVENTS PAGE
   Category filtering, search, and card display
========================================== */

/**
 * Toggle filter panel visibility
 */
function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const overlay = document.getElementById('filterOverlay');
    
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'flex';
        if (overlay) overlay.style.display = 'block';
    } else {
        panel.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
    }
}

/**
 * Toggle interested/starred status for an event
 * Persists state to server so Profile Interested tab is model-backed
 * @param {HTMLElement} button - The star button element
 */
function toggleStar(button) {
    var card = button.closest('.card');
    var postId = card.dataset.postId;
    var wasInterested = button.classList.contains('interested');
    var method = wasInterested ? 'DELETE' : 'POST';

    fetch('/users/interests/' + postId, { method: method })
        .then(function(response) {
            if (!response.ok) throw new Error('Failed to update interested state');
            button.classList.toggle('interested', !wasInterested);
        })
        .catch(function() {
            alert('Unable to update interested events right now. Please try again.');
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Reserved for page-level initialization.
});