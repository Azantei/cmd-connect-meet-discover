/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   ADMIN SETTINGS JAVASCRIPT
   Handles settings tabs, toggles, and tag management
========================================== */

// ==========================================
// STATE MANAGEMENT
// ==========================================

let settings = {
    platformName: 'C.M.D. — Connect. Meet. Discover.',
    distanceRadius: '10 mi'
};

let originalSettings = (typeof SAVED_PLATFORM_SETTINGS !== 'undefined')
    ? {
        platformName:   SAVED_PLATFORM_SETTINGS.platformName,
        distanceRadius: SAVED_PLATFORM_SETTINGS.distanceRadius
      }
    : { ...settings };

let tags = ['Outdoors', 'Music', 'Sports', 'Food & Drink', 'Arts', 'Tech', 'Fitness'];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // URL param from category add/remove redirect takes priority
    const urlTab = new URLSearchParams(window.location.search).get('tab');
    const savedTab = sessionStorage.getItem('settingsTab');
    if (urlTab) switchTab(urlTab);
    else if (savedTab) switchTab(savedTab);
    setupEventListeners();

    // Auto-dismiss inline category message
    const catMsg = document.getElementById('catInlineMsg');
    if (catMsg) setTimeout(function() { catMsg.style.display = 'none'; }, 4000);

    // Remove confirmation modal
    document.getElementById('removeConfirmBtn').addEventListener('click', () => {
        const form = document.getElementById('removeForm');
        if (form.getAttribute('action')) { form.submit(); closeRemoveModal(); }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeRemoveModal();
    });
});

/**
 * Open the category removal confirmation modal.
 * @param {number} catId - ID of the category to remove
 * @param {string} catName - Display name shown in the confirmation message
 */
function openRemoveModal(catId, catName) {
    document.getElementById('removeModalMsg').textContent =
        `Are you sure you want to remove "${catName}"? This cannot be undone.`;
    const form = document.getElementById('removeForm');
    form.action = `/admin/settings/categories/${catId}?_method=DELETE`;
    const modal = document.getElementById('removeModal');
    modal.style.display = 'flex';
    document.getElementById('removeConfirmBtn').focus();
}

/**
 * Close the category removal modal and clear its pending form action.
 */
function closeRemoveModal() {
    document.getElementById('removeModal').style.display = 'none';
    document.getElementById('removeForm').action = '';
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // Form inputs
    document.getElementById('platformName').addEventListener('input', (e) => {
        settings.platformName = e.target.value;
        e.target.classList.remove('invalid');
    });

    document.getElementById('distanceRadius').addEventListener('input', (e) => {
        settings.distanceRadius = e.target.value;
        e.target.classList.remove('invalid');
    });

    // Action buttons
    document.getElementById('saveChanges').addEventListener('click', saveChanges);
    document.getElementById('discardChanges').addEventListener('click', discardChanges);

    // Tag management — skip if the add button is a server-side submit
    const addBtn = document.getElementById('addTagBtn');
    if (addBtn && addBtn.type !== 'submit') {
        addBtn.addEventListener('click', addTag);
        document.getElementById('newTagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTag();
        });
        document.querySelectorAll('.remove-tag').forEach(button => {
            button.addEventListener('click', (e) => removeTag(e.target.dataset.tag));
        });
    }
}

// ==========================================
// TAB SWITCHING
// ==========================================

/**
 * Switch the active settings tab and persist the selection to sessionStorage
 * so the correct tab is restored after a category add/remove redirect.
 * @param {string} tabName - Tab identifier matching a data-tab attribute
 */
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    sessionStorage.setItem('settingsTab', tabName);
}

// ==========================================
// SAVE & DISCARD CHANGES
// ==========================================

/**
 * Validate platform name and distance radius inputs.
 * Distance radius must be a number optionally followed by a unit (e.g. "10 mi", "5 km").
 * @returns {string[]} Array of field IDs that failed validation
 */
function validateSettings() {
    const platformName = document.getElementById('platformName').value.trim();
    const distanceRadius = document.getElementById('distanceRadius').value.trim();
    const invalidFields = [];

    if (!platformName) {
        invalidFields.push('platformName');
    }
    if (!distanceRadius) {
        invalidFields.push('distanceRadius');
    } else {
        // Distance radius should be a number optionally followed by unit (e.g. "10 mi", "5 km", "10")
        const distancePattern = /^\d+\s*(mi|km|miles|kilometers)?$/i;
        if (!distancePattern.test(distanceRadius)) {
            invalidFields.push('distanceRadius');
        }
    }

    return invalidFields;
}

/**
 * Apply .invalid class to fields that failed validation.
 * @param {string[]} invalidFields - Array of field IDs to highlight
 */
function highlightInvalidFields(invalidFields) {
    document.getElementById('platformName').classList.toggle('invalid', invalidFields.includes('platformName'));
    document.getElementById('distanceRadius').classList.toggle('invalid', invalidFields.includes('distanceRadius'));
}

/**
 * Remove .invalid class from all settings fields.
 */
function clearInvalidHighlights() {
    document.getElementById('platformName').classList.remove('invalid');
    document.getElementById('distanceRadius').classList.remove('invalid');
}

/**
 * Validate and submit the general settings form.
 * Highlights invalid fields instead of submitting if validation fails.
 */
function saveChanges() {
    settings.platformName = document.getElementById('platformName').value;
    settings.distanceRadius = document.getElementById('distanceRadius').value;

    const invalidFields = validateSettings();
    if (invalidFields.length > 0) {
        highlightInvalidFields(invalidFields);
        return;
    }

    clearInvalidHighlights();
    document.getElementById('generalSettingsForm').submit();
}

/**
 * Reset settings fields to their last saved values and clear any validation errors.
 */
function discardChanges() {
    settings = { ...originalSettings };
    document.getElementById('platformName').value = settings.platformName;
    document.getElementById('distanceRadius').value = settings.distanceRadius;
    clearInvalidHighlights();
}

// ==========================================
// TAG MANAGEMENT
// ==========================================

/**
 * Add a new tag chip to the UI.
 * Note: this is a client-side-only preview; the actual category is persisted
 * via the server-side form submit on the categories tab.
 */
function addTag() {
    const input = document.getElementById('newTagInput');
    const tagName = input.value.trim();

    if (!tagName) {
        alert('Please enter a tag name');
        return;
    }

    if (tags.includes(tagName)) {
        alert('This tag already exists');
        return;
    }

    // Add to tags array
    tags.push(tagName);

    // Create tag chip
    const tagChip = document.createElement('div');
    tagChip.className = 'tag-chip';
    tagChip.innerHTML = `
        ${tagName} <button class="remove-tag" data-tag="${tagName}">X</button>
    `;

    // Add event listener to remove button
    tagChip.querySelector('.remove-tag').addEventListener('click', (e) => {
        removeTag(e.target.dataset.tag);
    });

    // Add to container
    document.getElementById('tagsList').appendChild(tagChip);

    // Clear input
    input.value = '';

    alert('Tag added successfully!');

    console.log('Tag added:', tagName);
    console.log('Current tags:', tags);

    // TODO: Send new tag to backend API
}

/**
 * Remove a tag chip from the UI after confirmation.
 * @param {string} tagName - Name of the tag to remove
 */
function removeTag(tagName) {
    if (!confirm(`Are you sure you want to remove the "${tagName}" tag?`)) {
        return;
    }

    // Remove from tags array
    tags = tags.filter(tag => tag !== tagName);

    // Remove from DOM
    const tagChips = document.querySelectorAll('.tag-chip');
    tagChips.forEach(chip => {
        if (chip.textContent.trim().startsWith(tagName)) {
            chip.remove();
        }
    });

    console.log('Tag removed:', tagName);
    console.log('Current tags:', tags);

    // TODO: Send deletion to backend API
}
