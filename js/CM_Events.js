/* ==========================================
   C.M.D. - ACTIVITY FEED
   Category filtering and search functionality
========================================== */

// Active filter categories
var activeFilters = [];

/**
 * Toggle category filter selection
 * Allows multiple categories to be selected at once
 * @param {HTMLElement} el - The clicked pill element
 */
function toggleCategory(el) {
    var cat = el.getAttribute('data-cat');
    el.classList.toggle('active');
    
    if (activeFilters.includes(cat)) {
        // Remove from active filters
        activeFilters = activeFilters.filter(function(c) { return c !== cat; });
    } else {
        // Add to active filters
        activeFilters.push(cat);
    }
    
    console.log('Active filters:', activeFilters);
    // TODO: Filter displayed cards based on activeFilters array
    // In a real implementation, this would filter the event cards shown
}

/**
 * Perform search on activity feed
 */
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        console.log('Searching for:', searchTerm);
        // Here you would filter the posts based on the search term
        // For now, this is a placeholder for the search functionality
    }
}

/**
 * Handle Enter key press in search input
 * @param {KeyboardEvent} event - The keypress event
 */
function handleSearchKeypress(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

/**
 * Toggle star (interested) status on an event
 * @param {HTMLElement} btn - The clicked star button
 * @param {string} eventTitle - The title of the event
 */
function toggleStar(btn, eventTitle) {
    btn.classList.toggle('starred');
    
    // In a real app, this would save to backend/localStorage
    // For now, just toggle the visual state
    if (btn.classList.contains('starred')) {
        console.log('Marked as interested:', eventTitle);
        // TODO: Add to user's interested events
    } else {
        console.log('Removed from interested:', eventTitle);
        // TODO: Remove from user's interested events
    }
}
