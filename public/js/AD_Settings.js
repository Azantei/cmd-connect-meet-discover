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
    distanceRadius: '10 mi',
    guestBrowsing: true,
    registrationOpen: true,
    maintenanceMode: false
};

let originalSettings = (typeof SAVED_PLATFORM_SETTINGS !== 'undefined')
    ? {
        platformName:     SAVED_PLATFORM_SETTINGS.platformName,
        distanceRadius:   SAVED_PLATFORM_SETTINGS.distanceRadius,
        guestBrowsing:    SAVED_PLATFORM_SETTINGS.guestBrowsing === 'true',
        registrationOpen: SAVED_PLATFORM_SETTINGS.registrationOpen === 'true',
        maintenanceMode:  SAVED_PLATFORM_SETTINGS.maintenanceMode === 'true'
      }
    : { ...settings };

let tags = ['Outdoors', 'Music', 'Sports', 'Food & Drink', 'Arts', 'Tech', 'Fitness'];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

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

    // Toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            handleToggle(e.target.closest('.toggle-switch'));
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
}

// ==========================================
// TOGGLE SWITCHES
// ==========================================

function handleToggle(toggleElement) {
    const settingName = toggleElement.dataset.setting;
    const isOn = toggleElement.classList.contains('on');

    if (isOn) {
        toggleElement.classList.remove('on');
        toggleElement.classList.add('off');
        toggleElement.querySelector('.toggle-text').textContent = 'OFF';
        settings[settingName] = false;
    } else {
        toggleElement.classList.remove('off');
        toggleElement.classList.add('on');
        toggleElement.querySelector('.toggle-text').textContent = 'ON';
        settings[settingName] = true;
    }

    // Sync to hidden input so the form POST carries the value
    const hidden = document.getElementById(settingName + 'Hidden');
    if (hidden) hidden.value = settings[settingName] ? 'true' : 'false';
}

// ==========================================
// SAVE & DISCARD CHANGES
// ==========================================

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

function highlightInvalidFields(invalidFields) {
    document.getElementById('platformName').classList.toggle('invalid', invalidFields.includes('platformName'));
    document.getElementById('distanceRadius').classList.toggle('invalid', invalidFields.includes('distanceRadius'));
}

function clearInvalidHighlights() {
    document.getElementById('platformName').classList.remove('invalid');
    document.getElementById('distanceRadius').classList.remove('invalid');
}

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

function discardChanges() {
    // Revert to original settings
    settings = { ...originalSettings };

    // Update form inputs
    document.getElementById('platformName').value = settings.platformName;
    document.getElementById('distanceRadius').value = settings.distanceRadius;

    clearInvalidHighlights();

    // Update toggles
    updateToggle('guestBrowsing', settings.guestBrowsing);
    updateToggle('registrationOpen', settings.registrationOpen);
    updateToggle('maintenanceMode', settings.maintenanceMode);

    console.log('Changes discarded');
}

function updateToggle(settingName, isOn) {
    const toggle = document.querySelector(`[data-setting="${settingName}"]`);
    if (isOn) {
        toggle.classList.remove('off');
        toggle.classList.add('on');
        toggle.querySelector('.toggle-text').textContent = 'ON';
    } else {
        toggle.classList.remove('on');
        toggle.classList.add('off');
        toggle.querySelector('.toggle-text').textContent = 'OFF';
    }
}

// ==========================================
// TAG MANAGEMENT
// ==========================================

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
