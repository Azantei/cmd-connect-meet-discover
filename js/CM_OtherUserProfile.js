var CARDS = [
    { title: "Morning Trail Hike", desc: "Join us for a scenic morning hike through the local trails. All skill levels welcome.", date: "Sat Mar 7", going: 12, color: "#2e3a4e", tags: ["Outdoors"] },
    { title: "Acoustic Jam Session", desc: "Bring your instrument or just your ears. Casual outdoor music gathering.", date: "Sun Mar 8", going: 8, color: "#3b4a2e", tags: ["Music"] },
    { title: "Community Picnic", desc: "A relaxed afternoon picnic in the park. Food, games, and good company.", date: "Sat Mar 14", going: 20, color: "#3b2e4a", tags: ["Food"] },
    { title: "Sunset Yoga", desc: "Wind down with a group yoga session as the sun sets over the park.", date: "Fri Mar 13", going: 15, color: "#2e3a4e", tags: ["Fitness"] },
];

function renderCards() {
    var grid = document.getElementById('cardsGrid');
    grid.innerHTML = CARDS.map(function(card) {
        return '<div class="card">' +
            '<div class="card-img" style="background-color:' + card.color + '"><div class="card-img-icon"></div></div>' +
            '<div class="card-tags">' + card.tags.map(function(t) { return '<span class="card-tag">' + t + '</span>'; }).join('') + '<span class="card-tag">1.2 mi</span></div>' +
            '<div class="card-body"><div class="card-title">' + card.title + '</div><div class="card-desc">' + card.desc + '</div></div>' +
            '<div class="card-footer"><span>\uD83D\uDCC5 ' + card.date + '</span><span>\uD83D\uDC65 ' + card.going + ' going</span></div>' +
            '</div>';
    }).join('');
}

function openReportModal() {
    var btn = document.getElementById('reportBtn');
    if (btn.classList.contains('reported')) return;
    document.getElementById('reportModal').style.display = 'flex';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

function submitReport() {
    closeReportModal();
    var btn = document.getElementById('reportBtn');
    btn.classList.add('reported');
    btn.innerHTML = '<span class="report-dot"></span> Reported';
}

// Close modal on overlay click
document.getElementById('reportModal').addEventListener('click', function(e) {
    if (e.target === this) closeReportModal();
});

renderCards();
