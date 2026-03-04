/* ==========================================
   C.M.D. - USER SETTINGS
   Settings page with interest selection and section switching
========================================== */

// All available interest categories
var ALL_INTERESTS = ["Outdoors", "Running", "Coffee", "Music", "Sports", "Food", "Arts", "Tech", "Fitness", "Games", "Photography", "Travel"];

// User's currently selected interests
var activeInterests = ["Outdoors", "Running", "Coffee", "Music"];

/**
 * Build and render interest selection pills
 * Dynamically creates pill buttons for all available interests
 */
var pillsWrap = document.getElementById('interestPills');
ALL_INTERESTS.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'pill' + (activeInterests.includes(cat) ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = function() {
        btn.classList.toggle('active');
    };
    pillsWrap.appendChild(btn);
});

/**
 * Switch between settings sections
 * Updates active nav item and displays selected section
 * @param {HTMLElement} el - The clicked nav item
 * @param {string} id - Section identifier (profile, account, privacy, notifications)
 */
function setSection(el, id) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.classList.remove('active');
        var dot = item.querySelector('.nav-dot');
        if (dot) dot.remove();
    });
    el.classList.add('active');
    var dot = document.createElement('span');
    dot.className = 'nav-dot';
    el.insertBefore(dot, el.firstChild);

    // Show section
    document.querySelectorAll('.section').forEach(function(s) { s.style.display = 'none'; });
    document.getElementById('section-' + id).style.display = 'block';
}

function toggleSwitch(el) {
    el.classList.toggle('on');
}

function showToast() {
    var toast = document.getElementById('toast');
    toast.style.display = 'block';
    setTimeout(function() { toast.style.display = 'none'; }, 2500);
}
