/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - USER PROFILE
   Profile cards, filtering, and tab switching
========================================== */

// Data arrays are seeded by server-rendered JSON in the profile view.
var MY_POSTS = [];
var UPCOMING_EVENTS = [];
var INTERESTED_EVENTS = [];
var DRAFTS = [];
var PREVIOUS_EVENTS = [];
var ATTENDED_EVENTS = [];

// Active filter categories
var activeFilters = [];
var currentTab = 'my-posts';

/**
 * Get the current dataset based on active tab
 * @returns {Array} - The appropriate dataset for the current tab
 */
function getCurrentData() {
    switch(currentTab) {
        case 'my-posts':
            return MY_POSTS;
        case 'upcoming':
            return UPCOMING_EVENTS;
        case 'interested':
            return INTERESTED_EVENTS;
        case 'previous':
            return PREVIOUS_EVENTS;
        case 'drafts':
            return DRAFTS;
        default:
            return MY_POSTS;
    }
}

/**
 * Render event cards based on active filters and current tab
 * Filters cards by selected categories and updates display
 */
function renderCards() {
    var grid = document.getElementById('cardsGrid');
    var noResults = document.getElementById('noResults');
    var currentData = getCurrentData();
    
    var filtered = activeFilters.length === 0
        ? currentData
        : currentData.filter(function(c) { return c.tags.some(function(t) { return activeFilters.includes(t); }); });

    if (filtered.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        
        // Update message based on tab
        if (currentData.length === 0) {
            if (currentTab === 'my-posts') {
                noResults.textContent = "You haven't created any posts yet.";
            } else if (currentTab === 'upcoming') {
                noResults.textContent = "You haven't RSVPed to any events yet.";
            } else if (currentTab === 'interested') {
                noResults.textContent = "You haven't marked any events as interested yet.";
            } else if (currentTab === 'previous') {
                noResults.textContent = "You haven't attended or created any past events yet.";
            } else if (currentTab === 'drafts') {
                noResults.textContent = "You don't have any drafts.";
            }
        } else {
            noResults.textContent = "No posts match the selected filters.";
        }
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        grid.innerHTML = filtered.map(function(card, index) {
            var footer = '';
            var statusBadge = '';
            
            if (currentTab === 'my-posts') {
                var attendeeText = card.maxAttendees ? (card.going + '/' + card.maxAttendees + ' going') : (card.going + ' going');
                statusBadge = '<span class="status-badge" style="background-color: #5a7a9e;">👥 ' + attendeeText + '</span>';
                footer = '<span>📅 ' + card.date + '</span><span style="color: #d32f2f; font-weight: 600; cursor: pointer;" onclick="event.preventDefault();event.stopPropagation();removeEvent(\'' + currentTab + '\', ' + index + ')">✕ Remove</span>';
            } else if (currentTab === 'upcoming') {
                var rsvpColor = card.rsvp === 'Going' ? '#2e7d32' : '#f57c00';
                var attendeeText = card.maxAttendees ? (card.going + '/' + card.maxAttendees + ' going') : (card.going + ' going');
                statusBadge = '<span class="status-badge" style="background-color:' + rsvpColor + ';">✓ ' + card.rsvp + '</span><span class="status-badge" style="background-color: #5a7a9e; margin-left: 8px;">👥 ' + attendeeText + '</span>';
                footer = '<span>📅 ' + card.date + '</span>';
            } else if (currentTab === 'interested') {
                var attendeeText = card.maxAttendees ? (card.going + '/' + card.maxAttendees + ' going') : (card.going + ' going');
                statusBadge = '<span class="status-badge" style="background-color: #f57c00;">⭐ Interested</span><span class="status-badge" style="background-color: #5a7a9e; margin-left: 8px;">👥 ' + attendeeText + '</span>';
                footer = '<span>📅 ' + card.date + '</span><span style="color: #d32f2f; font-weight: 600; cursor: pointer;" onclick="event.preventDefault();event.stopPropagation();removeEvent(\'' + currentTab + '\', ' + index + ')">✕ Remove</span>';
            } else if (currentTab === 'previous') {
                // Previous Events - show if created or attended
                if (card.type === 'created') {
                    statusBadge = '<span class="status-badge" style="background-color: #5a7a9e;">👤 Created</span>';
                } else if (card.type === 'attended') {
                    statusBadge = '<span class="status-badge" style="background-color: #2e7d32;">✓ Attended</span>';
                }
                footer = '<span>📅 ' + card.date + '</span><span>👥 ' + card.going + ' attended</span>';
            } else if (currentTab === 'drafts') {
                statusBadge = '<span class="status-badge" style="background-color: #888;">Not published</span>';
                footer = '<span style="color: #888;">📝 Draft</span><span style="color: #d32f2f; font-weight: 600; cursor: pointer;" onclick="event.preventDefault();event.stopPropagation();removeEvent(\'' + currentTab + '\', ' + index + ')">✕ Remove</span>';
            }
            
            var eventId = card.id || card.postId;
            var cardLink = eventId ? (card.status === 'Draft' ? '/posts/' + eventId + '/edit' : '/posts/' + eventId) : '#';
            var imgHtml = card.imageUrl
                ? '<div class="card-img" style="background-color:' + card.color + '"><img src="' + card.imageUrl + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;"></div>'
                : '<div class="card-img" style="background-color:' + card.color + '"><div class="card-img-icon"></div></div>';
            return '<a href="' + cardLink + '" class="card" style="text-decoration:none;color:inherit;display:block;">' +
                imgHtml +
                '<div class="card-tags">' + card.tags.map(function(t) { return '<span class="card-tag">' + t + '</span>'; }).join('') + '<span class="card-tag">1.2 mi</span>' + statusBadge + '</div>' +
                '<div class="card-body"><div class="card-title">' + card.title + '</div><div class="card-desc">' + card.desc + '</div></div>' +
                '<div class="card-footer">' + footer + '</div>' +
                '</a>';
        }).join('');
    }
}

/**
 * Switch between profile tabs
 * @param {HTMLElement} el - The clicked tab element
 * @param {string} id - Tab identifier
 */
function setTab(el, id) {
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
    currentTab = id;
    
    // Clear filters when switching tabs
    clearFilters();
    
    // Re-render cards for new tab
    renderCards();
}

/**
 * Toggle sort dropdown visibility
 * Closes filter panel if open
 */
function toggleSort() {
    var dd = document.getElementById('sortDropdown');
    dd.classList.toggle('open');
    document.getElementById('filterPanel').style.display = 'none';
}

/**
 * Set selected sort option
 * @param {HTMLElement} el - The clicked dropdown item
 * @param {string} val - Sort option label
 */
function setSort(el, val) {
    document.getElementById('sortLabel').textContent = val;
    document.querySelectorAll('.dropdown-item').forEach(function(i) { i.classList.remove('active-item'); });
    el.classList.add('active-item');
    document.getElementById('sortDropdown').classList.remove('open');
}

/**
 * Toggle filter panel visibility
 * Closes sort dropdown if open
 */
function toggleFilter() {
    var panel = document.getElementById('filterPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    document.getElementById('sortDropdown').classList.remove('open');
}

/**
 * Toggle category filter selection
 * Updates active filters and re-renders cards
 * @param {HTMLElement} el - The clicked filter pill element
 */
function toggleCatFilter(el) {
    var cat = el.getAttribute('data-cat');
    el.classList.toggle('active');
    if (activeFilters.includes(cat)) {
        activeFilters = activeFilters.filter(function(c) { return c !== cat; });
    } else {
        activeFilters.push(cat);
    }
    updateFilterUI();
    renderCards();
}

/**
 * Clear all active filters
 * Resets filter pills and re-renders all cards
 */
function clearFilters() {
    activeFilters = [];
    document.querySelectorAll('.fpill').forEach(function(p) { p.classList.remove('active'); });
    updateFilterUI();
    renderCards();
}

/**
 * Update filter button UI based on active filters
 * Shows filter count and clear button when filters are active
 */
function updateFilterUI() {
    var filterBtn = document.getElementById('filterBtn');
    var clearBtn = document.getElementById('clearBtn');
    var countSpan = document.getElementById('filterCount');
    if (activeFilters.length > 0) {
        filterBtn.classList.add('active-filter');
        countSpan.textContent = '(' + activeFilters.length + ')';
        clearBtn.style.display = 'inline-block';
    } else {
        filterBtn.classList.remove('active-filter');
        countSpan.textContent = '';
        clearBtn.style.display = 'none';
    }
}

/**
 * Remove an event from the user's lists or permanently delete their own post
 * @param {string} tab - The current tab identifier
 * @param {number} index - The index of the event in the filtered array
 */
function removeEvent(tab, index) {
    var currentData = getCurrentData();
    
    // Get the actual data array based on applied filters
    var filtered = activeFilters.length === 0
        ? currentData
        : currentData.filter(function(c) { return c.tags.some(function(t) { return activeFilters.includes(t); }); });
    
    // Find the event to remove from the filtered list
    var eventToRemove = filtered[index];
    
    // Special handling for My Posts - requires confirmation and backend DELETE
    if (tab === 'my-posts') {
        var confirmed = confirm(
            'Are you sure you want to delete this event?\n\n' +
            '"' + eventToRemove.title + '"\n\n' +
            'This will permanently remove the event and it will no longer be visible to anyone. ' +
            'All RSVPs will be cancelled.'
        );

        if (!confirmed) return;

        var eventId = eventToRemove.id;
        if (!eventId) {
            var actualIndex = MY_POSTS.indexOf(eventToRemove);
            if (actualIndex > -1) MY_POSTS.splice(actualIndex, 1);
            renderCards();
            return;
        }

        fetch('/posts/' + eventId + '?_method=DELETE', { method: 'POST' })
            .then(function() {
                var actualIndex = MY_POSTS.indexOf(eventToRemove);
                if (actualIndex > -1) MY_POSTS.splice(actualIndex, 1);
                UPCOMING_EVENTS = UPCOMING_EVENTS.filter(function(e) { return e.id !== eventId; });
                INTERESTED_EVENTS = INTERESTED_EVENTS.filter(function(e) { return e.id !== eventId; });
                renderCards();
            })
            .catch(function() {
                alert('Failed to delete the post. Please try again.');
            });
        return;
    } else if (tab === 'upcoming') {
        var actualIndex = UPCOMING_EVENTS.indexOf(eventToRemove);
        if (actualIndex > -1) {
            UPCOMING_EVENTS.splice(actualIndex, 1);
            console.log('Removed from Upcoming Events:', eventToRemove.title);
        }
    } else if (tab === 'interested') {
        if (!eventToRemove.id) {
            INTERESTED_EVENTS = INTERESTED_EVENTS.filter(function(e) { return e.title !== eventToRemove.title; });
            renderCards();
            return;
        }
        fetch('/users/interests/' + eventToRemove.id, { method: 'DELETE' })
            .then(function(response) {
                if (!response.ok) throw new Error('Failed to remove interested post');
                INTERESTED_EVENTS = INTERESTED_EVENTS.filter(function(e) { return e.id !== eventToRemove.id; });
                renderCards();
            })
            .catch(function() {
                alert('Failed to remove interested event. Please try again.');
            });
        return;
    } else if (tab === 'drafts') {
        var actualIndex = DRAFTS.indexOf(eventToRemove);
        if (actualIndex > -1) {
            DRAFTS.splice(actualIndex, 1);
            console.log('Removed draft:', eventToRemove.title);
        }
    }
    
    // Re-render the cards
    renderCards();
}

// Close dropdowns on outside click
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-wrap')) {
        document.getElementById('sortDropdown').classList.remove('open');
    }
});

// Initial render on page load
renderCards();
