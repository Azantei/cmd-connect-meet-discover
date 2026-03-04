/* ==========================================
   C.M.D. - ACTIVITY FEED
   Category filtering functionality
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
