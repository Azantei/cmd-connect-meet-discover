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

let originalSettings = { ...settings };

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
    });

    document.getElementById('distanceRadius').addEventListener('input', (e) => {
        settings.distanceRadius = e.target.value;
    });

    // Action buttons
    document.getElementById('saveChanges').addEventListener('click', saveChanges);
    document.getElementById('discardChanges').addEventListener('click', discardChanges);

    // Tag management
    document.getElementById('addTagBtn').addEventListener('click', addTag);
    document.getElementById('newTagInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTag();
        }
    });

    // Remove tag buttons
    document.querySelectorAll('.remove-tag').forEach(button => {
        button.addEventListener('click', (e) => {
            removeTag(e.target.dataset.tag);
        });
    });
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

    // Toggle state
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
}

// ==========================================
// SAVE & DISCARD CHANGES
// ==========================================

function saveChanges() {
    // Update original settings
    originalSettings = { ...settings };

    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');

    // TODO: Send settings to backend API
}

function discardChanges() {
    // Revert to original settings
    settings = { ...originalSettings };

    // Update form inputs
    document.getElementById('platformName').value = settings.platformName;
    document.getElementById('distanceRadius').value = settings.distanceRadius;

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
