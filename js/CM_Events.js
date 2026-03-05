/* ==========================================
   C.M.D. - ACTIVITY FEED
   Category filtering and search functionality
========================================== */

/**
 * Set active category filter
 * Removes active class from all pills and adds to selected
 * @param {HTMLElement} el - The clicked pill element
 */
function setCategory(el) {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
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
