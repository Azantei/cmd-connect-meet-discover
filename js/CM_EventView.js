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
        btn.textContent = "✓ RSVP'd";
        btn.classList.add('active');
    } else {
        btn.textContent = "RSVP";
        btn.classList.remove('active');
    }
}

/**
 * Open report post modal
 * Prevents opening if post already reported
 */
function openReportModal() {
    var btn = document.getElementById('reportBtn');
    if (btn.classList.contains('reported')) return;
    document.getElementById('reportModal').style.display = 'flex';
}

/**
 * Close report post modal
 */
function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    // Clear form when closing
    document.querySelectorAll('input[name="reason"]').forEach(function(radio) {
        radio.checked = false;
    });
    document.getElementById('reportComment').value = '';
}

/**
 * Submit report for this post
 * Shows confirmation dialog before submitting
 * Updates button to show reported state
 */
function submitReport() {
    // Get selected reason
    var selectedReason = document.querySelector('input[name="reason"]:checked');
    if (!selectedReason) {
        alert('Please select a reason for reporting this post.');
        return;
    }
    
    // Get optional comment
    var comment = document.getElementById('reportComment').value.trim();
    
    var confirmed = confirm(
        "Are you sure you wish to report this post?\n\n" +
        "This action cannot be undone. Our moderation team will review your report and take appropriate action. " +
        "False reports may result in penalties to your account."
    );
    
    if (confirmed) {
        // In a real implementation, this would send the report to the backend
        console.log('Report submitted:', {
            reason: selectedReason.nextSibling.textContent.trim(),
            comment: comment || '(No additional comments)'
        });
        
        closeReportModal();
        
        // Mark button as reported
        var btn = document.getElementById('reportBtn');
        btn.classList.add('reported');
        btn.textContent = '✓ Reported';
        btn.disabled = true;
        
        alert('Thank you for your report. Our moderation team will review this post.');
    }
}
