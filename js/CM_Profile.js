/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - USER PROFILE
   Mock event cards, filtering, and tab switching
========================================== */

// Mock event data for "My Posts" - events the user created
var MY_POSTS = [
    { title: "Morning Trail Hike", desc: "Join us for a scenic morning hike through the local trails. All skill levels welcome.", date: "Sat Mar 7", going: 12, maxAttendees: null, color: "#2e3a4e", tags: ["Outdoors"], status: "Published" },
    { title: "Community Picnic", desc: "A relaxed afternoon picnic in the park. Food, games, and good company.", date: "Sat Mar 14", going: 20, maxAttendees: 30, color: "#3b2e4a", tags: ["Food"], status: "Published" },
    { title: "Coffee Tasting", desc: "Explore local roasters and taste a variety of single-origin coffees.", date: "Sun Mar 22", going: 10, maxAttendees: 12, color: "#4a3b2e", tags: ["Coffee"], status: "Published" },
];

// Mock event data for "Upcoming Events" - events user is attending (Going)
var UPCOMING_EVENTS = [
    { title: "Acoustic Jam Session", desc: "Bring your instrument or just your ears. Casual outdoor music gathering.", date: "Sun Mar 8", going: 8, maxAttendees: 15, color: "#3b4a2e", tags: ["Music"], rsvp: "Going" },
    { title: "5K Fun Run", desc: "A casual community run through Capitol Hill. All paces welcome!", date: "Sat Mar 21", going: 30, maxAttendees: null, color: "#3b4a2e", tags: ["Running", "Outdoors"], rsvp: "Going" },
];

// Mock event data for "Interested" - events user marked with star (Interested)
var INTERESTED_EVENTS = [
    { title: "Sunset Yoga", desc: "Wind down with a group yoga session as the sun sets over the park.", date: "Fri Mar 13", going: 15, maxAttendees: 20, color: "#2e3a4e", tags: ["Fitness"] },
    { title: "Art Gallery Opening", desc: "Celebrate local artists at the community gallery's spring exhibition.", date: "Thu Mar 19", going: 25, maxAttendees: null, color: "#4a2e3b", tags: ["Arts"] },
    { title: "Community Picnic", desc: "A relaxed afternoon picnic in the park. Food, games, and good company.", date: "Sat Mar 14", going: 20, maxAttendees: 30, color: "#3b2e4a", tags: ["Food"] },
];

// Mock event data for "Drafts" - unpublished events user created
var DRAFTS = [
    { title: "Book Club Meetup", desc: "Monthly book discussion over coffee. This month: 'The Great Gatsby'", date: "TBD", going: 0, color: "#3b3b3b", tags: ["Coffee", "Arts"], status: "Draft" },
    { title: "Neighborhood Clean-up", desc: "Help keep our community beautiful. Supplies provided.", date: "TBD", going: 0, color: "#2e4a3b", tags: ["Outdoors"], status: "Draft" },
];

// Mock event data for "Previous Events" - past events user created or attended
var PREVIOUS_EVENTS = [
    { title: "Morning Trail Hike", desc: "Join us for a scenic morning hike through the local trails. All skill levels welcome.", date: "Sat Feb 28", going: 12, color: "#2e3a4e", tags: ["Outdoors"], type: "attended" },
    { title: "Coffee & Coding Workshop", desc: "Learn the basics of web development in this beginner-friendly workshop.", date: "Thu Feb 26", going: 18, color: "#4a3b2e", tags: ["Tech", "Coffee"], type: "created" },
    { title: "Acoustic Jam Session", desc: "Bring your instrument or just your ears. Casual outdoor music gathering.", date: "Sun Feb 22", going: 8, color: "#3b4a2e", tags: ["Music"], type: "attended" },
    { title: "Community Picnic", desc: "A relaxed afternoon picnic in the park. Food, games, and good company.", date: "Sat Feb 14", going: 20, color: "#3b2e4a", tags: ["Food"], type: "created" },
    { title: "Sunset Yoga", desc: "Wind down with a group yoga session as the sun sets over the park.", date: "Fri Feb 6", going: 15, color: "#2e3a4e", tags: ["Fitness"], type: "attended" },
    { title: "Tech Meetup: AI in 2026", desc: "Discussion on AI trends and practical applications in our daily lives.", date: "Wed Jan 28", going: 35, color: "#2e4a4e", tags: ["Tech"], type: "created" },
];

// Mock event data for "Previously Attended Events" - used in guest view
var ATTENDED_EVENTS = [
    { title: "Morning Trail Hike", desc: "Join us for a scenic morning hike through the local trails. All skill levels welcome.", date: "Sat Feb 28", going: 12, color: "#2e3a4e", tags: ["Outdoors"] },
    { title: "Acoustic Jam Session", desc: "Bring your instrument or just your ears. Casual outdoor music gathering.", date: "Sun Feb 22", going: 8, color: "#3b4a2e", tags: ["Music"] },
    { title: "Community Picnic", desc: "A relaxed afternoon picnic in the park. Food, games, and good company.", date: "Sat Feb 14", going: 20, color: "#3b2e4a", tags: ["Food"] },
    { title: "Sunset Yoga", desc: "Wind down with a group yoga session as the sun sets over the park.", date: "Fri Feb 6", going: 15, color: "#2e3a4e", tags: ["Fitness"] },
];

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
            var stored = JSON.parse(localStorage.getItem('cmd_interested_events') || '[]');
            return stored.length > 0 ? stored : INTERESTED_EVENTS;
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
    
    // Special handling for My Posts - requires confirmation
    if (tab === 'my-posts') {
        var confirmed = confirm(
            'Are you sure you want to delete this event?\n\n' +
            '"' + eventToRemove.title + '"\n\n' +
            'This will permanently remove the event and it will no longer be visible to anyone. ' +
            'All RSVPs will be cancelled.'
        );
        
        if (!confirmed) {
            return; // User cancelled, don't delete
        }
        
        // Remove from MY_POSTS
        var actualIndex = MY_POSTS.indexOf(eventToRemove);
        if (actualIndex > -1) {
            MY_POSTS.splice(actualIndex, 1);
            console.log('Permanently deleted event:', eventToRemove.title);
            
            // Also remove from all users' UPCOMING_EVENTS and INTERESTED_EVENTS
            // (simulating backend removal across all users)
            UPCOMING_EVENTS = UPCOMING_EVENTS.filter(function(e) { return e.title !== eventToRemove.title; });
            INTERESTED_EVENTS = INTERESTED_EVENTS.filter(function(e) { return e.title !== eventToRemove.title; });
            console.log('Removed from all users\' lists');
        }
    } else if (tab === 'upcoming') {
        var actualIndex = UPCOMING_EVENTS.indexOf(eventToRemove);
        if (actualIndex > -1) {
            UPCOMING_EVENTS.splice(actualIndex, 1);
            console.log('Removed from Upcoming Events:', eventToRemove.title);
        }
    } else if (tab === 'interested') {
        var storedInterested = JSON.parse(localStorage.getItem('cmd_interested_events') || '[]');
        if (storedInterested.length > 0) {
            var updatedStored = storedInterested.filter(function(e) { return e.title !== eventToRemove.title; });
            localStorage.setItem('cmd_interested_events', JSON.stringify(updatedStored));
            console.log('Removed from Interested (localStorage):', eventToRemove.title);
        } else {
            var actualIndex = INTERESTED_EVENTS.indexOf(eventToRemove);
            if (actualIndex > -1) {
                INTERESTED_EVENTS.splice(actualIndex, 1);
                console.log('Removed from Interested:', eventToRemove.title);
            }
        }
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
