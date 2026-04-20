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

/**
 * Toggle filter panel visibility
 */
function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const overlay = document.getElementById('filterOverlay');
    
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'flex';
        if (overlay) overlay.style.display = 'block';
    } else {
        panel.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
    }
}

/**
 * Toggle filter pill selection
 * @param {HTMLElement} pill - The clicked filter pill
 */
function toggleFilterPill(pill) {
    pill.classList.toggle('active');
    applyFilters();
}

/**
 * Apply all active filters to the event cards
 */
function applyFilters() {
    const cards = document.querySelectorAll('.card');
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Get active category filters
    const activeCategoryPills = document.querySelectorAll('.filter-pill.active');
    const activeCategories = Array.from(activeCategoryPills).map(pill => pill.dataset.category);
    
    // Get distance filter
    const distanceFilter = document.getElementById('distanceFilter');
    const maxDistance = distanceFilter.value === 'all' ? Infinity : parseFloat(distanceFilter.value);
    
    // Get date filter
    const dateFilter = document.getElementById('dateFilter');
    const dateFilterValue = dateFilter.value;
    
    let visibleCount = 0;
    
    // Filter cards
    cards.forEach(card => {
        const cardTags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.trim());
        const cardTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const cardDesc = card.querySelector('.card-desc')?.textContent.toLowerCase() || '';
        
        // Extract distance from card (e.g., "1.2 mi" -> 1.2)
        const distanceTag = cardTags.find(tag => tag.includes('mi'));
        const cardDistance = distanceTag ? parseFloat(distanceTag.replace('mi', '').trim()) : 0;
        
        // Check category match
        const categoryMatch = activeCategories.length === 0 || 
                             activeCategories.some(cat => cardTags.includes(cat));
        
        // Check search match
        const searchMatch = searchTerm === '' || 
                           cardTitle.includes(searchTerm) || 
                           cardDesc.includes(searchTerm);
        
        // Check distance match
        const distanceMatch = cardDistance <= maxDistance;
        
        // Date filtering would require actual date data on cards
        // For now, we'll assume all dates match (placeholder)
        const dateMatch = true; // TODO: Implement actual date filtering when date data is available
        
        // Show card only if all filters match
        const shouldShow = categoryMatch && searchMatch && distanceMatch && dateMatch;
        card.style.display = shouldShow ? '' : 'none';
        
        if (shouldShow) visibleCount++;
    });
    
    // Update filter count badge
    updateFilterCount();
    
    // Show "no results" message if needed
    showNoResultsMessage(visibleCount);
}

/**
 * Update the filter count badge
 */
function updateFilterCount() {
    const filterCountEl = document.getElementById('filterCount');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    const activeCategoryCount = document.querySelectorAll('.filter-pill.active').length;
    const distanceFilter = document.getElementById('distanceFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    const distanceActive = distanceFilter.value !== 'all' ? 1 : 0;
    const dateActive = dateFilter.value !== 'all' ? 1 : 0;
    
    const totalActiveFilters = activeCategoryCount + distanceActive + dateActive;
    
    if (totalActiveFilters > 0) {
        filterCountEl.textContent = totalActiveFilters;
        filterCountEl.style.display = 'inline-block';
        clearFiltersBtn.style.display = 'block';
    } else {
        filterCountEl.style.display = 'none';
        clearFiltersBtn.style.display = 'none';
    }
}

/**
 * Clear all active filters
 */
function clearAllFilters() {
    // Clear category pills
    document.querySelectorAll('.filter-pill.active').forEach(pill => {
        pill.classList.remove('active');
    });
    
    // Reset dropdowns
    document.getElementById('distanceFilter').value = 'all';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('customDateRange').style.display = 'none';
    
    // Reapply filters (which will show all cards)
    applyFilters();
}

/**
 * Show "no results" message when no cards are visible
 * @param {number} visibleCount - Number of visible cards
 */
function showNoResultsMessage(visibleCount) {
    let noResultsMsg = document.getElementById('noResultsMessage');
    
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">🔍</div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 8px; color: #333;">No activities found</h3>
                    <p style="margin-bottom: 20px;">Try adjusting your filters or expanding your search radius.</p>
                    <button onclick="clearAllFilters()" style="padding: 10px 20px; background-color: #c0522a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95rem;">Clear All Filters</button>
                </div>
            `;
            document.querySelector('.cards-grid').appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
    } else {
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
}

/**
 * Filter event cards based on active categories and search term
 * Shows only cards matching both category filter and search term
 */
function filterCards() {
    applyFilters();
}

/**
 * Perform search based on current search input value
 * Delegates to filterCards which handles both search and category filtering
 */
function performSearch() {
    // Just call filterCards which now handles both category and search filtering
    filterCards();
}

/**
 * Handle keypress events in search input
 * Triggers search when user presses Enter
 * @param {Event} event - Keyboard event
 */
function handleSearchKeypress(event) {
    // Trigger search when Enter key is pressed
    if (event.key === 'Enter') {
        performSearch();
    }
}

var INTERESTED_KEY = 'cmd_interested_events';

/**
 * Toggle interested/starred status for an event
 * Persists state to localStorage so Profile page can read it
 * @param {HTMLElement} button - The star button element
 */
function toggleStar(button) {
    button.classList.toggle('interested');

    var card = button.closest('.card');
    var title = card.querySelector('.card-title').textContent.trim();
    var desc = card.querySelector('.card-desc').textContent.trim();
    var footerSpans = card.querySelectorAll('.card-footer span');
    var dateText = footerSpans[0] ? footerSpans[0].textContent.replace(/^[^\w]*/, '').trim() : '';
    var goingText = footerSpans[1] ? footerSpans[1].textContent : '';
    var tags = Array.from(card.querySelectorAll('.tags-left .tag'))
        .map(function(t) { return t.textContent.trim(); })
        .filter(function(t) { return !t.includes('mi'); });
    var styleAttr = card.querySelector('.card-img').getAttribute('style') || '';
    var colorMatch = styleAttr.match(/background-color:\s*([^;]+)/);
    var color = colorMatch ? colorMatch[1].trim() : '#2e3a4e';
    var goingMatch = goingText.match(/(\d+)\/(\d+)/) || goingText.match(/(\d+)/);
    var going = goingMatch ? parseInt(goingMatch[1]) : 0;
    var maxAttendees = (goingMatch && goingMatch[2]) ? parseInt(goingMatch[2]) : null;

    var stored = JSON.parse(localStorage.getItem(INTERESTED_KEY) || '[]');
    if (button.classList.contains('interested')) {
        if (!stored.some(function(e) { return e.title === title; })) {
            stored.push({ title: title, desc: desc, date: dateText, going: going, maxAttendees: maxAttendees, color: color, tags: tags });
        }
    } else {
        stored = stored.filter(function(e) { return e.title !== title; });
    }
    localStorage.setItem(INTERESTED_KEY, JSON.stringify(stored));
}

/**
 * Handle date filter change and restore star states from localStorage
 */
document.addEventListener('DOMContentLoaded', function() {
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            const customDateRange = document.getElementById('customDateRange');
            if (this.value === 'custom') {
                customDateRange.style.display = 'flex';
            } else {
                customDateRange.style.display = 'none';
            }
        });
    }

    // Restore star states from localStorage
    var stored = JSON.parse(localStorage.getItem(INTERESTED_KEY) || '[]');
    var starredTitles = stored.map(function(e) { return e.title; });
    document.querySelectorAll('.card').forEach(function(card) {
        var titleEl = card.querySelector('.card-title');
        if (titleEl && starredTitles.indexOf(titleEl.textContent.trim()) !== -1) {
            var starBtn = card.querySelector('.star-btn');
            if (starBtn) starBtn.classList.add('interested');
        }
    });
});