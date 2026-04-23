/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   ADMIN ANALYTICS JAVASCRIPT
   Handles analytics display and date filtering
   Note: Charts and data will be connected to backend
========================================== */

// ==========================================
// DATE RANGE HELPERS
// ==========================================

var RANGE_DAYS = { today: 0, week: 7, month: 30, quarter: 90, year: 365 };

// Formats a Date as YYYY-MM-DD for query-string compatibility.
function localDateStr(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
}

// Builds a start/end range ending today from a preset key (week, month, etc.).
function getRangeDates(range) {
    var end = new Date();
    var start = new Date();
    var days = (range in RANGE_DAYS) ? RANGE_DAYS[range] : 7;
    start.setDate(start.getDate() - days);
    return {
        startDate: localDateStr(start),
        endDate: localDateStr(end)
    };
}

// Infers which preset most closely matches the current analytics start date.
function detectRange(startDate) {
    if (!startDate) return null;
    var diffDays = Math.round((new Date() - new Date(startDate)) / 86400000);
    if (diffDays <= 1)  return 'today';
    if (diffDays <= 8)  return 'week';
    if (diffDays <= 31) return 'month';
    if (diffDays <= 92) return 'quarter';
    return 'year';
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    syncSelect();
    setupEventListeners();
});

function syncSelect() {
    var range = detectRange(window.ANALYTICS_START_DATE);
    if (range) document.getElementById('dateRange').value = range;
}

// ==========================================
// CHART UPDATES (Placeholder for backend)
// ==========================================

function updateUserGrowthChart() {
    // This will be implemented when connecting to backend
    // Will likely use a charting library like Chart.js or D3.js
    console.log('User growth chart update - awaiting backend integration');
}

function updateTopCategories() {
    // This will be implemented when connecting to backend
    console.log('Top categories update - awaiting backend integration');
}

function updateActivityLog() {
    // This will be implemented when connecting to backend
    console.log('Activity log update - awaiting backend integration');
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    document.getElementById('dateRange').addEventListener('change', (e) => {
        // "All time" clears date filters and loads the base analytics route.
        if (e.target.value === 'all') { window.location.href = '/admin/analytics'; return; }

        // Preset ranges are converted to explicit start/end query params.
        var dates = getRangeDates(e.target.value);
        window.location.href = '/admin/analytics?startDate=' + dates.startDate + '&endDate=' + dates.endDate;
    });
}

// ==========================================
// EXPORT FUNCTIONS (for potential use)
// ==========================================

function exportAnalyticsReport() {
    // Placeholder for exporting analytics as PDF/CSV
    console.log('Export analytics report - feature to be implemented');
    alert('Analytics export feature coming soon!');
}
