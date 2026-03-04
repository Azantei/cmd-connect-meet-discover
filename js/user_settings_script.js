var ALL_INTERESTS = ["Outdoors", "Running", "Coffee", "Music", "Sports", "Food", "Arts", "Tech", "Fitness", "Games", "Photography", "Travel"];
var activeInterests = ["Outdoors", "Running", "Coffee", "Music"];

// Build interest pills
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
