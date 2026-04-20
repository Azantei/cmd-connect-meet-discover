/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - EVENT VIEW
   RSVP button toggle functionality
========================================== */

var INTERESTED_KEY = 'cmd_interested_events';

// Track RSVP state
var rsvpActive = false;

function toggleInterested() {
    var btn = document.getElementById('interestedBtn');
    if (!btn) return;
    var postId = btn.dataset.postId;
    var stored = JSON.parse(localStorage.getItem(INTERESTED_KEY) || '[]');
    var idx = stored.findIndex(function(e) { return String(e.postId) === String(postId); });

    if (idx !== -1) {
        stored.splice(idx, 1);
        btn.classList.remove('active');
        btn.textContent = '\u2605 Interested';
    } else {
        var tags;
        try { tags = JSON.parse(btn.dataset.postTags || '[]'); } catch(e) { tags = []; }
        stored.push({
            postId:      postId,
            title:       btn.dataset.postTitle || '',
            desc:        btn.dataset.postDesc  || '',
            date:        btn.dataset.postDate  || '',
            going:       parseInt(btn.dataset.postGoing) || 0,
            maxAttendees: btn.dataset.postMax ? parseInt(btn.dataset.postMax) : null,
            color:       '#2e3a4e',
            imageUrl:    btn.dataset.postImage || null,
            tags:        tags
        });
        btn.classList.add('active');
        btn.textContent = '\u2605 Interested \u2713';
    }
    localStorage.setItem(INTERESTED_KEY, JSON.stringify(stored));
}

document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('interestedBtn');
    if (btn) {
        var stored = JSON.parse(localStorage.getItem(INTERESTED_KEY) || '[]');
        if (stored.some(function(e) { return String(e.postId) === String(btn.dataset.postId); })) {
            btn.classList.add('active');
            btn.textContent = '\u2605 Interested \u2713';
        }
    }
});

/**
 * Toggle RSVP status for the event
 * Updates button text and styling based on state
 * Shows confirmation dialog when canceling RSVP
 */
function toggleRsvp() {
    var btn = document.getElementById('rsvpBtn');
    
    // If currently RSVPed and trying to cancel
    if (rsvpActive) {
        var confirmed = confirm("Are you sure you want to cancel your RSVP?");
        
        if (!confirmed) {
            // User said no, keep RSVP active
            return;
        }
        
        // User confirmed cancellation
        rsvpActive = false;
        btn.textContent = "RSVP";
        btn.classList.remove('active');
        
        // Show cancellation confirmation message
        alert("Your RSVP has been cancelled.");
        
        // Update attendee count (decrement by 1)
        updateAttendeeCount(-1);
    } else {
        // Toggling RSVP on
        rsvpActive = true;
        btn.textContent = "✓ RSVP'd";
        btn.classList.add('active');
        
        // Show success message
        alert("You're going! This event has been added to your schedule.");
        
        // Update attendee count (increment by 1)
        updateAttendeeCount(1);
    }
}

/**
 * Update the attendee count displayed on the page
 * @param {number} change - Amount to change count by (+1 or -1)
 */
function updateAttendeeCount(change) {
    // Get the attendees info box
    var attendeesBox = document.querySelector('.info-box:nth-child(3) .info-value');
    if (!attendeesBox) return;
    
    // Extract current count (e.g., "12 going · RSVP open" -> 12)
    var text = attendeesBox.textContent;
    var match = text.match(/(\d+)\s*(?:\/\s*(\d+))?\s*going/);
    
    if (match) {
        var currentCount = parseInt(match[1]);
        var maxCount = match[2] ? parseInt(match[2]) : null;
        var newCount = currentCount + change;
        
        // Build new text
        var newText;
        if (maxCount) {
            newText = newCount + "/" + maxCount + " going";
            // Check if event is now full
            if (newCount >= maxCount) {
                newText += " · Event Full";
            } else {
                newText += " · RSVP open";
            }
        } else {
            newText = newCount + " going · RSVP open";
        }
        
        attendeesBox.textContent = newText;
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
