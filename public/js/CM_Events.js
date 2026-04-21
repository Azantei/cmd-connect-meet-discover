/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - EVENTS PAGE
   Category filtering, search, and card display
========================================== */

var selectedCategories = new Set(window.INIT_CATEGORIES || []);
var filterDateFrom = window.INIT_DATE_FROM || '';
var filterDateTo   = window.INIT_DATE_TO   || '';

/**
 * Toggle filter panel visibility
 */
function toggleFilterPanel() {
    var panel   = document.getElementById('filterPanel');
    var overlay = document.getElementById('filterOverlay');
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display   = 'flex';
        if (overlay) overlay.style.display = 'block';
    } else {
        panel.style.display   = 'none';
        if (overlay) overlay.style.display = 'none';
    }
}

/**
 * Update the filter count badge and Clear All button visibility
 */
function updateFilterBadge() {
    var count    = selectedCategories.size + (filterDateFrom ? 1 : 0) + (filterDateTo ? 1 : 0);
    var badge    = document.getElementById('filterCount');
    var clearBtn = document.getElementById('clearFiltersBtn');
    if (count > 0) {
        badge.textContent    = count;
        badge.style.display  = 'inline-block';
        clearBtn.style.display = 'block';
    } else {
        badge.style.display    = 'none';
        clearBtn.style.display = 'none';
    }
}

/**
 * Inject active filter values as hidden inputs before the search form submits,
 * so the search term and all active filters travel together.
 */
function injectHiddenFilterInputs() {
    var container = document.getElementById('hiddenFilterInputs');
    container.innerHTML = '';
    selectedCategories.forEach(function(cat) {
        var input  = document.createElement('input');
        input.type = 'hidden';
        input.name = 'category';
        input.value = cat;
        container.appendChild(input);
    });
    if (filterDateFrom) {
        var input  = document.createElement('input');
        input.type = 'hidden';
        input.name = 'dateFrom';
        input.value = filterDateFrom;
        container.appendChild(input);
    }
    if (filterDateTo) {
        var input  = document.createElement('input');
        input.type = 'hidden';
        input.name = 'dateTo';
        input.value = filterDateTo;
        container.appendChild(input);
    }
}

/**
 * Build URL from current selections and navigate (called by Apply Filters button)
 */
function applyFilters() {
    filterDateFrom = document.getElementById('filterDateFrom').value;
    filterDateTo   = document.getElementById('filterDateTo').value;

    var params = new URLSearchParams();
    var q = document.getElementById('search-input').value.trim();
    if (q) params.set('q', q);
    selectedCategories.forEach(function(cat) { params.append('category', cat); });
    if (filterDateFrom) params.set('dateFrom', filterDateFrom);
    if (filterDateTo)   params.set('dateTo',   filterDateTo);

    window.location.href = '/events' + (params.toString() ? '?' + params.toString() : '');
}

/**
 * Clear all active filters and reload (preserving search term)
 */
function clearAllFilters() {
    var q = document.getElementById('search-input').value.trim();
    window.location.href = '/events' + (q ? '?q=' + encodeURIComponent(q) : '');
}

/**
 * Toggle interested/starred status for an event
 * Persists state to server so Profile Interested tab is model-backed
 * @param {HTMLElement} button - The star button element
 */
function toggleStar(button) {
    var card   = button.closest('.card');
    var postId = card.dataset.postId;
    var wasInterested = button.classList.contains('interested');
    var method = wasInterested ? 'DELETE' : 'POST';

    fetch('/users/interests/' + postId, { method: method })
        .then(function(response) {
            if (!response.ok) throw new Error('Failed to update interested state');
            button.classList.toggle('interested', !wasInterested);
        })
        .catch(function() {
            alert('Unable to update interested events right now. Please try again.');
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Mark pills that are already active from server state
    document.querySelectorAll('.filter-pill').forEach(function(pill) {
        if (selectedCategories.has(pill.dataset.cat)) {
            pill.classList.add('active');
        }
        pill.addEventListener('click', function() {
            var cat = this.dataset.cat;
            if (selectedCategories.has(cat)) {
                selectedCategories.delete(cat);
                this.classList.remove('active');
            } else {
                selectedCategories.add(cat);
                this.classList.add('active');
            }
            updateFilterBadge();
        });
    });

    // Restore date inputs from server state
    var fromInput = document.getElementById('filterDateFrom');
    var toInput   = document.getElementById('filterDateTo');
    if (filterDateFrom) fromInput.value = filterDateFrom;
    if (filterDateTo)   toInput.value   = filterDateTo;
    fromInput.addEventListener('change', function() { filterDateFrom = this.value; updateFilterBadge(); });
    toInput.addEventListener('change',   function() { filterDateTo   = this.value; updateFilterBadge(); });

    // Carry active filters when the search form submits
    document.getElementById('searchForm').addEventListener('submit', injectHiddenFilterInputs);

    updateFilterBadge();
});
