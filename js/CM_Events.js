/* ==========================================
   C.M.D. - EVENTS PAGE
   Category filtering, search, and card display
========================================== */

/**
 * Toggle category pill selection
 * Adds/removes active state and triggers filtering
 * @param {HTMLElement} el - The clicked category pill
 */
function toggleCategory(el) {
    // Toggle the active class on the clicked pill
    el.classList.toggle('active');
    
    // Filter cards based on active categories
    filterCards();
}

/**
 * Filter event cards based on active categories and search term
 * Shows only cards matching both category filter and search term
 */
function filterCards() {
    const activePills = document.querySelectorAll('.pill.active');
    const cards = document.querySelectorAll('.card');
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Get active category names
    const activeCategories = Array.from(activePills).map(pill => pill.textContent.trim());
    
    // Filter cards
    cards.forEach(card => {
        const cardTags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.trim());
        const cardTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const cardDesc = card.querySelector('.card-desc')?.textContent.toLowerCase() || '';
        
        // Check if card matches category filter (if any categories are selected)
        const categoryMatch = activeCategories.length === 0 || activeCategories.some(cat => cardTags.includes(cat));
        
        // Check if card matches search term (in title or description)
        const searchMatch = searchTerm === '' || cardTitle.includes(searchTerm) || cardDesc.includes(searchTerm);
        
        // Show card only if it matches both category and search filters
        card.style.display = (categoryMatch && searchMatch) ? '' : 'none';
    });
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

/**
 * Toggle interested/starred status for an event
 * Adds/removes visual indicator that user is interested
 * @param {HTMLElement} button - The star button element
 */
function toggleStar(button) {
    // Toggle the interested class
    button.classList.toggle('interested');
}