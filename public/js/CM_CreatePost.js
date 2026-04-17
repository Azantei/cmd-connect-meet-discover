/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - CREATE POST
   Form interaction and live preview logic
========================================== */

/**
 * Toggle category pill selection
 * Allows multiple categories to be selected
 * @param {HTMLElement} el - The clicked category pill element
 */
function toggleCat(el) {
    el.classList.toggle('active');
    updatePreviewCategories();
}

/**
 * Handle banner photo upload
 * Shows preview of uploaded image
 * @param {Event} event - The file input change event
 */
function handleBannerUpload(event) {
    const file = event.target.files[0];
    const previewBanner = document.getElementById('previewBanner');
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewBanner.style.backgroundImage = 'url(' + e.target.result + ')';
            previewBanner.style.backgroundSize = 'cover';
            previewBanner.style.backgroundPosition = 'center';
            previewBanner.innerHTML = ''; // Remove placeholder text
        };
        
        reader.readAsDataURL(file);
    }
}

/**
 * Update preview categories based on selected pills
 */
function updatePreviewCategories() {
    const activePills = document.querySelectorAll('#categoryPills .pill.active');
    const previewCategories = document.getElementById('previewCategories');
    
    if (activePills.length === 0) {
        previewCategories.innerHTML = '<span class="preview-tag">Select categories above</span>';
    } else {
        previewCategories.innerHTML = '';
        activePills.forEach(function(pill) {
            const tag = document.createElement('span');
            tag.className = 'preview-tag';
            tag.textContent = pill.textContent;
            previewCategories.appendChild(tag);
        });
    }
}

/**
 * Update preview title
 */
function updatePreviewTitle() {
    const titleInput = document.getElementById('eventTitle');
    const previewTitle = document.getElementById('previewTitle');
    
    if (titleInput.value.trim() === '') {
        previewTitle.textContent = 'Your event title will appear here';
        previewTitle.style.color = '#999';
    } else {
        previewTitle.textContent = titleInput.value;
        previewTitle.style.color = '';
    }
}

/**
 * Update preview description
 */
function updatePreviewDesc() {
    const descInput = document.getElementById('eventDesc');
    const previewDesc = document.getElementById('previewDesc');
    
    if (descInput.value.trim() === '') {
        previewDesc.textContent = 'Your event description will appear here';
        previewDesc.style.color = '#999';
    } else {
        previewDesc.textContent = descInput.value;
        previewDesc.style.color = '';
    }
}

/**
 * Update preview details (date, time, location)
 */
function updatePreviewDetails() {
    const dateInput = document.getElementById('eventDate');
    const timeInput = document.getElementById('eventTime');
    const locationInput = document.getElementById('eventLocation');
    const previewDetails = document.getElementById('previewDetails');
    
    const dateText = dateInput.value ? formatDate(dateInput.value) : 'Date not set';
    const timeText = timeInput.value ? formatTime(timeInput.value) : 'Time not set';
    const locationText = locationInput.value ? locationInput.value : 'Location not set';
    
    previewDetails.innerHTML = 
        '<span>📅 ' + dateText + '</span>' +
        '<span>🕐 ' + timeText + '</span>' +
        '<span>📍 ' + locationText + '</span>';
}

/**
 * Format date string to readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Format time string to readable format
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time
 */
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return displayHour + ':' + minutes + ' ' + ampm;
}

// Set up event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    const titleInput = document.getElementById('eventTitle');
    const descInput = document.getElementById('eventDesc');
    const dateInput = document.getElementById('eventDate');
    const timeInput = document.getElementById('eventTime');
    const locationInput = document.getElementById('eventLocation');
    
    if (titleInput) titleInput.addEventListener('input', updatePreviewTitle);
    if (descInput) descInput.addEventListener('input', updatePreviewDesc);
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            validateDate();
            updatePreviewDetails();
        });
    }
    if (timeInput) timeInput.addEventListener('change', updatePreviewDetails);
    if (locationInput) locationInput.addEventListener('input', updatePreviewDetails);
    
    // Set minimum date to today
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});

/**
 * Validate that the selected date is not in the past
 * @returns {boolean} True if date is valid, false otherwise
 */
function validateDate() {
    const dateInput = document.getElementById('eventDate');
    if (!dateInput.value) return true;
    
    const selectedDate = new Date(dateInput.value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('Event date cannot be in the past. Please select a future date.');
        dateInput.value = '';
        updatePreviewDetails();
        return false;
    }
    return true;
}

/**
 * Toggle RSVP options visibility
 * Shows/hides max attendees input field based on RSVP toggle state
 */
function toggleRsvpOptions() {
    const rsvpToggle = document.getElementById('rsvpToggle');
    const maxAttendeesRow = document.getElementById('maxAttendeesRow');
    
    if (rsvpToggle.checked) {
        maxAttendeesRow.style.display = 'flex';
    } else {
        maxAttendeesRow.style.display = 'none';
        document.getElementById('maxAttendees').value = '';
    }
}

/**
 * Handle cancel button click
 * Shows confirmation dialog before discarding changes
 */
function handleCancel() {
    const confirmed = confirm(
        "Are you sure you want to cancel?\n\n" +
        "This will discard all changes to your event post and return you to the Explore page. " +
        "If you'd like to continue working on this later, consider using 'Save As Draft' instead."
    );
    
    if (confirmed) {
        // Redirect to events page or previous page
        window.location.href = '/events';
    }
}

/**
 * Validate all required form fields
 * @returns {boolean} True if form is valid, false otherwise
 */
function validateForm() {
    let isValid = true;
    
    // Clear previous error states
    clearAllErrors();
    
    // Validate title
    const titleInput = document.getElementById('eventTitle');
    if (!titleInput.value.trim()) {
        showError('eventTitle', 'title-error', 'Title is required');
        isValid = false;
    }
    
    // Validate description
    const descInput = document.getElementById('eventDesc');
    if (!descInput.value.trim()) {
        showError('eventDesc', 'desc-error', 'Description is required');
        isValid = false;
    }
    
    // Validate date
    const dateInput = document.getElementById('eventDate');
    if (!dateInput.value) {
        showError('eventDate', 'date-error', 'Date is required');
        isValid = false;
    }
    
    // Validate time
    const timeInput = document.getElementById('eventTime');
    if (!timeInput.value) {
        showError('eventTime', 'time-error', 'Start time is required');
        isValid = false;
    }
    
    // Validate location
    const locationInput = document.getElementById('eventLocation');
    if (!locationInput.value.trim()) {
        showError('eventLocation', 'location-error', 'Location is required');
        isValid = false;
    }
    
    // Validate categories (at least one must be selected)
    const activePills = document.querySelectorAll('#categoryPills .pill.active');
    if (activePills.length === 0) {
        showError('categoryPills', 'categories-error', 'Please select at least one category');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Show error message for a specific input
 * @param {string} inputId - ID of the input element
 * @param {string} errorId - ID of the error message element
 * @param {string} message - Error message to display
 */
function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    
    if (input) input.classList.add('error');
    if (errorElement) errorElement.textContent = message;
}

/**
 * Clear error message for a specific input
 * @param {string} inputId - ID of the input element
 * @param {string} errorId - ID of the error message element
 */
function clearError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    
    if (input) input.classList.remove('error');
    if (errorElement) errorElement.textContent = '';
}

/**
 * Clear all error messages and states
 */
function clearAllErrors() {
    // Remove error class from all inputs
    document.querySelectorAll('input.error, textarea.error, .pills.error').forEach(el => {
        el.classList.remove('error');
    });
    
    // Clear all error message texts
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
}

/**
 * Handle post button click
 * Validates form and submits if valid
 */
function handlePost() {
    if (!validateForm()) {
        // Scroll to first error field
        const firstErrorField = document.querySelector('.error');
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Form is valid, proceed with posting
    const confirmed = confirm(
        "Ready to post your event?\n\n" +
        "Your event will be visible to all community members immediately."
    );
    
    if (confirmed) {
        console.log('Posting event...');
        // In a real implementation, this would send data to the backend
        alert('Event posted successfully!');
        window.location.href = '/events';
    }
}

/**
 * Handle save draft button click
 * Saves current form state without validation
 */
function handleSaveDraft() {
    console.log('Saving draft...');
    // In a real implementation, this would save to local storage or backend
    alert('Draft saved! You can continue editing later.');
}
