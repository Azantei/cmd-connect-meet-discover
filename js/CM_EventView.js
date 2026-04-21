/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
    C.M.D. - EVENT VIEW
    Interested button interaction
========================================== */

function toggleInterested() {
    var btn = document.getElementById('interestedBtn');
    if (!btn) return;
    var postId = btn.dataset.postId;
    var isActive = btn.classList.contains('active');
    var method = isActive ? 'DELETE' : 'POST';

    fetch('/users/interests/' + postId, { method: method })
        .then(function(response) {
            if (!response.ok) throw new Error('Failed to update interested state');
            var nowActive = !isActive;
            btn.classList.toggle('active', nowActive);
            btn.textContent = nowActive ? '★ Interested (saved)' : '★ Interested';
        })
        .catch(function() {
            alert('Unable to update interested state right now. Please try again.');
        });
}

function confirmReportSubmission() {
    return window.confirm('This action cannot be undone!');
}


