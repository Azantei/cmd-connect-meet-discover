/* ==========================================
   C.M.D. - USER PROFILE
   Mock event cards, filtering, and tab switching
========================================== */

// Mock event data for "My Posts" - events the user created
var MY_POSTS = [
    { title: "Morning Trail Hike", desc: "Join us for a scenic morning hike through the local trails. All skill levels welcome.", date: "Sat Mar 7", going: 12, color: "#2e3a4e", tags: ["Outdoors"], status: "Published" },
    { title: "Community Picnic", desc: "A relaxed afternoon picnic in the park. Food, games, and good company.", date: "Sat Mar 14", going: 20, color: "#3b2e4a", tags: ["Food"], status: "Published" },
    { title: "Coffee Tasting", desc: "Explore local roasters and taste a variety of single-origin coffees.", date: "Sun Mar 22", going: 10, color: "#4a3b2e", tags: ["Coffee"], status: "Published" },
];

// Mock event data for "Upcoming Events" - events user is attending (Going)
var UPCOMING_EVENTS = [
    { title: "Acoustic Jam Session", desc: "Bring your instrument or just your ears. Casual outdoor music gathering.", date: "Sun Mar 8", going: 8, color: "#3b4a2e", tags: ["Music"], rsvp: "Going" },
    { title: "5K Fun Run", desc: "A casual community run through Capitol Hill. All paces welcome!", date: "Sat Mar 21", going: 30, color: "#3b4a2e", tags: ["Running", "Outdoors"], rsvp: "Going" },
];

// Mock event data for "Interested" - events user marked with star (Interested)
var INTERESTED_EVENTS = [
    { title: "Sunset Yoga", desc: "Wind down with a group yoga session as the sun sets over the park.", date: "Fri Mar 13", going: 15, color: "#2e3a4e", tags: ["Fitness"] },
    { title: "Art Gallery Opening", desc: "Celebrate local artists at the community gallery's spring exhibition.", date: "Thu Mar 19", going: 25, color: "#4a2e3b", tags: ["Arts"] },
    { title: "Community Picnic", desc: "A relaxed afternoon picnic in the park. Food, games, and good company.", date: "Sat Mar 14", going: 20, color: "#3b2e4a", tags: ["Food"] },
];

// Mock event data for "Drafts" - unpublished events user created
var DRAFTS = [
    { title: "Book Club Meetup", desc: "Monthly book discussion over coffee. This month: 'The Great Gatsby'", date: "TBD", going: 0, color: "#3b3b3b", tags: ["Coffee", "Arts"], status: "Draft" },
    { title: "Neighborhood Clean-up", desc: "Help keep our community beautiful. Supplies provided.", date: "TBD", going: 0, color: "#2e4a3b", tags: ["Outdoors"], status: "Draft" },
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
            return INTERESTED_EVENTS;
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
            } else if (currentTab === 'drafts') {
                noResults.textContent = "You don't have any drafts.";
            }
        } else {
            noResults.textContent = "No posts match the selected filters.";
        }
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        grid.innerHTML = filtered.map(function(card) {
            var footer = '';
            if (currentTab === 'my-posts') {
                footer = '<span>📅 ' + card.date + '</span><span>👥 ' + card.going + ' going</span>';
            } else if (currentTab === 'upcoming') {
                var rsvpColor = card.rsvp === 'Going' ? '#2e7d32' : '#f57c00';
                footer = '<span>📅 ' + card.date + '</span><span style="color:' + rsvpColor + '; font-weight: 600;">✓ ' + card.rsvp + '</span>';
            } else if (currentTab === 'interested') {
                footer = '<span>📅 ' + card.date + '</span><span style="color: #f57c00; font-weight: 600;">⭐ Interested</span>';
            } else if (currentTab === 'drafts') {
                footer = '<span style="color: #888;">📝 Draft</span><span style="color: #888;">Not published</span>';
            }
            
            return '<div class="card">' +
                '<div class="card-img" style="background-color:' + card.color + '"><div class="card-img-icon"></div></div>' +
                '<div class="card-tags">' + card.tags.map(function(t) { return '<span class="card-tag">' + t + '</span>'; }).join('') + '<span class="card-tag">1.2 mi</span></div>' +
                '<div class="card-body"><div class="card-title">' + card.title + '</div><div class="card-desc">' + card.desc + '</div></div>' +
                '<div class="card-footer">' + footer + '</div>' +
                '</div>';
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

function clearFilters() {
    activeFilters = [];
    document.querySelectorAll('.fpill').forEach(function(p) { p.classList.remove('active'); });
    updateFilterUI();
    renderCards();
}

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

// Close dropdowns on outside click
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-wrap')) {
        document.getElementById('sortDropdown').classList.remove('open');
    }
});

renderCards();
