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
    filterCards();
}

/**
 * Filter displayed cards based on active filters and search term
 */
function filterCards() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(function(card) {
        // Get all category tags in the card (excluding distance tags that contain 'mi')
        const tagElements = card.querySelectorAll('.tag');
        const cardCategories = [];
        
        tagElements.forEach(function(tag) {
            const tagText = tag.textContent.trim();
            // Only include tags that don't contain 'mi' (distance tags)
            if (!tagText.includes('mi')) {
                cardCategories.push(tagText);
            }
        });
        
        // Check if card matches category filters
        const matchesFilter = activeFilters.length === 0 || 
                             cardCategories.some(function(cat) {
                                 return activeFilters.includes(cat);
                             });
        
        // Check if card matches search term
        let matchesSearch = true;
        if (searchTerm !== '') {
            const title = card.querySelector('.card-title');
            const desc = card.querySelector('.card-desc');
            
            if (title && desc) {
                const titleText = title.textContent.toLowerCase();
                const descText = desc.textContent.toLowerCase();
                matchesSearch = titleText.includes(searchTerm) || descText.includes(searchTerm);
            }
        }
        
        // Show card only if it matches BOTH filter and search criteria
        card.style.display = (matchesFilter && matchesSearch) ? 'block' : 'none';
    });
}

/**
 * Perform search on activity feed
 * Filters cards based on search term in title or description
 */
function performSearch() {
    filterCards();
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
