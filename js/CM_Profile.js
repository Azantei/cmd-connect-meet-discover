var CARDS = [
    { title: "Morning Trail Hike", desc: "Join us for a scenic morning hike through the local trails. All skill levels welcome.", date: "Sat Mar 7", going: 12, color: "#2e3a4e", tags: ["Outdoors"] },
    { title: "Acoustic Jam Session", desc: "Bring your instrument or just your ears. Casual outdoor music gathering.", date: "Sun Mar 8", going: 8, color: "#3b4a2e", tags: ["Music"] },
    { title: "Community Picnic", desc: "A relaxed afternoon picnic in the park. Food, games, and good company.", date: "Sat Mar 14", going: 20, color: "#3b2e4a", tags: ["Food"] },
    { title: "Sunset Yoga", desc: "Wind down with a group yoga session as the sun sets over the park.", date: "Fri Mar 13", going: 15, color: "#2e3a4e", tags: ["Fitness"] },
    { title: "5K Fun Run", desc: "A casual community run through Capitol Hill. All paces welcome!", date: "Sat Mar 21", going: 30, color: "#3b4a2e", tags: ["Running", "Outdoors"] },
    { title: "Coffee Tasting", desc: "Explore local roasters and taste a variety of single-origin coffees.", date: "Sun Mar 22", going: 10, color: "#4a3b2e", tags: ["Coffee"] },
];

var activeFilters = [];

function renderCards() {
    var grid = document.getElementById('cardsGrid');
    var noResults = document.getElementById('noResults');
    var filtered = activeFilters.length === 0
        ? CARDS
        : CARDS.filter(function(c) { return c.tags.some(function(t) { return activeFilters.includes(t); }); });

    if (filtered.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        grid.innerHTML = filtered.map(function(card) {
            return '<div class="card">' +
                '<div class="card-img" style="background-color:' + card.color + '"><div class="card-img-icon"></div></div>' +
                '<div class="card-tags">' + card.tags.map(function(t) { return '<span class="card-tag">' + t + '</span>'; }).join('') + '<span class="card-tag">1.2 mi</span></div>' +
                '<div class="card-body"><div class="card-title">' + card.title + '</div><div class="card-desc">' + card.desc + '</div></div>' +
                '<div class="card-footer"><span>\uD83D\uDCC5 ' + card.date + '</span><span>\uD83D\uDC65 ' + card.going + ' going</span></div>' +
                '</div>';
        }).join('');
    }
}

function setTab(el, id) {
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
}

function toggleSort() {
    var dd = document.getElementById('sortDropdown');
    dd.classList.toggle('open');
    document.getElementById('filterPanel').style.display = 'none';
}

function setSort(el, val) {
    document.getElementById('sortLabel').textContent = val;
    document.querySelectorAll('.dropdown-item').forEach(function(i) { i.classList.remove('active-item'); });
    el.classList.add('active-item');
    document.getElementById('sortDropdown').classList.remove('open');
}

function toggleFilter() {
    var panel = document.getElementById('filterPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    document.getElementById('sortDropdown').classList.remove('open');
}

function toggleCatFilter(el) {
    var cat = el.getAttribute('data-cat');
    el.classList.toggle('active');
    if (activeFilters.includes(cat)) {
        activeFilters = activeFilters.filter(function(c) { return c !== cat; });
    } else {
        activeFilters.push(cat);
    }
    updateFilterUI();
    renderCards();
}

function clearFilters() {
    activeFilters = [];
    document.querySelectorAll('.fpill').forEach(function(p) { p.classList.remove('active'); });
    updateFilterUI();
    renderCards();
}

function updateFilterUI() {
    var filterBtn = document.getElementById('filterBtn');
    var clearBtn = document.getElementById('clearBtn');
    var countSpan = document.getElementById('filterCount');
    if (activeFilters.length > 0) {
        filterBtn.classList.add('active-filter');
        countSpan.textContent = '(' + activeFilters.length + ')';
        clearBtn.style.display = 'inline-block';
    } else {
        filterBtn.classList.remove('active-filter');
        countSpan.textContent = '';
        clearBtn.style.display = 'none';
    }
}

// Close dropdowns on outside click
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-wrap')) {
        document.getElementById('sortDropdown').classList.remove('open');
    }
});

renderCards();
