/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor.
  Logs and further project documents can be found at:
  <insert link to our Google Drive for the project here>.
*/
/* ==========================================
   C.M.D. - OTHER USER PROFILE
   View another user's previously attended events
========================================== */

// Mock event data for other user's previously attended events
var ATTENDED_EVENTS = [
    { title: "Morning Trail Hike", desc: "Join us for a scenic morning hike through the local trails. All skill levels welcome.", date: "Sat Mar 7", going: 12, color: "#2e3a4e", tags: ["Outdoors"] },
    { title: "Acoustic Jam Session", desc: "Bring your instrument or just your ears. Casual outdoor music gathering.", date: "Sun Mar 8", going: 8, color: "#3b4a2e", tags: ["Music"] },
    { title: "Community Picnic", desc: "A relaxed afternoon picnic in the park. Food, games, and good company.", date: "Sat Feb 28", going: 20, color: "#3b2e4a", tags: ["Food"] },
    { title: "Sunset Yoga", desc: "Wind down with a group yoga session as the sun sets over the park.", date: "Fri Feb 20", going: 15, color: "#2e3a4e", tags: ["Fitness"] },
    { title: "5K Fun Run", desc: "A casual community run through Capitol Hill. All paces welcome!", date: "Sat Feb 14", going: 30, color: "#3b4a2e", tags: ["Sports", "Outdoors"] },
];

// Active filter categories
var activeFilters = [];

/**
 * Render event cards based on active filters
 * Shows previously attended events if privacy allows
 */
function renderCards() {
    var grid = document.getElementById('cardsGrid');
    var noResults = document.getElementById('noResults');
    
    var filtered = activeFilters.length === 0
        ? ATTENDED_EVENTS
        : ATTENDED_EVENTS.filter(function(c) { return c.tags.some(function(t) { return activeFilters.includes(t); }); });

    if (filtered.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        if (activeFilters.length > 0) {
            noResults.textContent = "No attended events match the selected filters.";
        }
    } else {
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        grid.innerHTML = filtered.map(function(card) {
            var statusBadge = '<span class="status-badge" style="background-color: #2e7d32;">✓ Attended</span>';
            
            return '<div class="card">' +
                '<div class="card-img" style="background-color:' + card.color + '"><div class="card-img-icon"></div></div>' +
                '<div class="card-tags">' + card.tags.map(function(t) { return '<span class="card-tag">' + t + '</span>'; }).join('') + '<span class="card-tag">1.2 mi</span>' + statusBadge + '</div>' +
                '<div class="card-body"><div class="card-title">' + card.title + '</div><div class="card-desc">' + card.desc + '</div></div>' +
                '<div class="card-footer"><span>📅 ' + card.date + '</span><span>👥 ' + card.going + ' attended</span></div>' +
                '</div>';
        }).join('');
    }
}

/**
 * Toggle sort dropdown visibility
 * Closes filter panel if open
 */
function toggleSort() {
    var dd = document.getElementById('sortDropdown');
    dd.classList.toggle('open');
    document.getElementById('filterPanel').style.display = 'none';
}

/**
 * Set selected sort option
 * @param {HTMLElement} el - The clicked dropdown item
 * @param {string} val - Sort option label
 */
function setSort(el, val) {
    document.getElementById('sortLabel').textContent = val;
    document.querySelectorAll('.dropdown-item').forEach(function(i) { i.classList.remove('active-item'); });
    el.classList.add('active-item');
    document.getElementById('sortDropdown').classList.remove('open');
}

/**
 * Toggle filter panel visibility
 * Closes sort dropdown if open
 */
function toggleFilter() {
    var panel = document.getElementById('filterPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    document.getElementById('sortDropdown').classList.remove('open');
}

/**
 * Toggle category filter selection
 * Updates active filters and re-renders cards
 * @param {HTMLElement} el - The clicked filter pill element
 */
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

/**
 * Clear all active filters
 */
function clearFilters() {
    activeFilters = [];
    document.querySelectorAll('.fpill').forEach(function(p) { p.classList.remove('active'); });
    updateFilterUI();
    renderCards();
}

/**
 * Update filter button UI based on active filters
 */
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

/**
 * Open report user modal
 * Prevents opening if user already reported
 */
function openReportModal() {
    var btn = document.getElementById('reportBtn');
    if (btn.classList.contains('reported')) return;
    document.getElementById('reportModal').style.display = 'flex';
}

/**
 * Close report user modal
 */
function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    // Clear form when closing
    document.querySelectorAll('input[name="reason"]').forEach(function(radio) {
        radio.checked = false;
    });
    document.getElementById('reportComment').value = '';
}

/**
 * Submit report for this user
 * Shows confirmation dialog before submitting
 * Updates button to show reported state
 */
function submitReport() {
    // Get selected reason
    var selectedReason = document.querySelector('input[name="reason"]:checked');
    if (!selectedReason) {
        alert('Please select a reason for reporting this user.');
        return;
    }
    
    // Get optional comment
    var comment = document.getElementById('reportComment').value.trim();
    
    var confirmed = confirm(
        "Are you sure you wish to report this user?\n\n" +
        "This action cannot be undone. Our moderation team will review your report and take appropriate action. " +
        "False reports may result in penalties to your account."
    );
    
    if (confirmed) {
        // In a real implementation, this would send the report to the backend
        console.log('Report submitted:', {
            reason: selectedReason.nextSibling.textContent.trim(),
            comment: comment || '(No additional comments)'
        });
        
        closeReportModal();
        
        // Mark button as reported
        var btn = document.getElementById('reportBtn');
        btn.classList.add('reported');
        btn.innerHTML = 'Reported';
        
        alert('Thank you for your report. Our moderation team will review this user.');
    }
}

// Close modal on overlay click
document.getElementById('reportModal').addEventListener('click', function(e) {
    if (e.target === this) closeReportModal();
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-wrap')) {
        document.getElementById('sortDropdown').classList.remove('open');
    }
    if (!e.target.closest('#filterBtn') && !e.target.closest('#filterPanel')) {
        document.getElementById('filterPanel').style.display = 'none';
    }
});

// Initial render
renderCards();
