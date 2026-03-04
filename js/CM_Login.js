/* ==========================================
   C.M.D. - LOGIN/SIGNUP
   Tab switching between sign in and sign up forms
========================================== */

/**
 * Switch between sign in and sign up tabs
 * @param {string} tab - Tab identifier ('signin' or 'signup')
 */
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    const idx = tab === 'signin' ? 0 : 1;
    document.querySelectorAll('.tab-btn')[idx].classList.add('active');
}

/**
 * Check URL hash on page load and switch to signup tab if needed
 */
window.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#signup') {
        switchTab('signup');
    }
});
