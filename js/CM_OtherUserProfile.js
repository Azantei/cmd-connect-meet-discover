/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - OTHER USER PROFILE
   View another user's previously attended events
========================================== */

var PROFILE_POSTS = [];

// Active filter categories
var activeFilters = [];

/**
 * Render event cards based on active filters
 * Shows previously attended events if privacy allows
 */
function renderCards() {
    var grid = document.getElementById('cardsGrid');
    var noResults = document.getElementById('noResults');
    
    var filtered = activeFilters.length === 0
        ? PROFILE_POSTS
        : PROFILE_POSTS.filter(function(c) { return c.tags.some(function(t) { return activeFilters.includes(t); }); });

    if (filtered.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        if (activeFilters.length > 0) {
            noResults.textContent = "No posts match the selected filters.";
        }
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        grid.innerHTML = filtered.map(function(card) {
            var imgHtml = card.imageUrl
                ? '<div class="card-img" style="background-color:' + card.color + '"><img src="' + card.imageUrl + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;"></div>'
                : '<div class="card-img" style="background-color:' + card.color + '"><div class="card-img-icon"></div></div>';
            var link = card.id ? '/posts/' + card.id : '#';
            return '<a href="' + link + '" style="text-decoration:none;color:inherit;display:block;">' +
                '<div class="card">' +
                imgHtml +
                '<div class="card-tags">' + card.tags.map(function(t) { return '<span class="card-tag">' + t + '</span>'; }).join('') + '</div>' +
                '<div class="card-body"><div class="card-title">' + card.title + '</div><div class="card-desc">' + card.desc + '</div></div>' +
                '<div class="card-footer"><span>📅 ' + card.date + '</span></div>' +
                '</div>' +
                '</a>';
        }).join('');
    }
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
 */
function clearFilters() {
    activeFilters = [];
    document.querySelectorAll('.fpill').forEach(function(p) { p.classList.remove('active'); });
    updateFilterUI();
    renderCards();
}

/**
 * Update filter button UI based on active filters
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

// Close modal on overlay click
var _reportModal = document.getElementById('reportModal');
if (_reportModal) {
    _reportModal.addEventListener('click', function(e) {
        if (e.target === this) _reportModal.style.display = 'none';
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-wrap')) {
        document.getElementById('sortDropdown').classList.remove('open');
    }
    if (!e.target.closest('#filterBtn') && !e.target.closest('#filterPanel')) {
        document.getElementById('filterPanel').style.display = 'none';
    }
});

// renderCards() is called by the inline script after PROFILE_POSTS is populated
