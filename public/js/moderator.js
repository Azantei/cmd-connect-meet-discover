/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   C.M.D. - MODERATION DASHBOARD
   Mock data, report rendering, sidebar & filter logic
========================================== */

// Helper to create timestamps for sorting (reports sorted by date submitted, newest first)
const now = Date.now();
const ms = { hour: 3600000, day: 86400000 };

// Mock reports data (submittedAt used for sorting by date submitted)
// userActive: false simulates Exception Flow 1 (user account no longer active)
// author: target user for post reports (user we warn)
const mockReports = [
    { id: 1, type: 'post', title: "Free Concert Downtown", reporter: "user", author: "@eventhost", time: "2 hrs ago", reason: "Spam", note: "", submittedAt: now - 2 * ms.hour, userActive: true },
    { id: 2, type: 'user', title: "@toxic_user99", reporter: "member", author: "@toxic_user99", time: "5 hrs ago", reason: "Harassment", note: "", submittedAt: now - 5 * ms.hour, userActive: true },
    { id: 3, type: 'post', title: "Neighborhood Watch Sign-Up", reporter: "curious", author: "@neighbor_jane", time: "1 day ago", reason: "Inappropriate", note: "", submittedAt: now - 1 * ms.day, userActive: true },
    { id: 4, type: 'post', title: "Coffee Meetup at Central Park", reporter: "community_member", author: "@coffee_lover", time: "3 hrs ago", reason: "Spam", note: "", submittedAt: now - 3 * ms.hour, userActive: true },
    { id: 5, type: 'user', title: "@spammer123", reporter: "moderator_help", author: "@spammer123", time: "6 hrs ago", reason: "Spam", note: "", submittedAt: now - 6 * ms.hour, userActive: false },
    { id: 6, type: 'post', title: "Yoga in the Park - Saturday", reporter: "local_user", author: "@yoga_instructor", time: "12 hrs ago", reason: "Inappropriate", note: "", submittedAt: now - 12 * ms.hour, userActive: true },
    { id: 7, type: 'post', title: "Lost Dog - Please Help", reporter: "concerned", author: "@petowner", time: "1 day ago", reason: "Spam", note: "", submittedAt: now - 1 * ms.day - 2 * ms.hour, userActive: true }
];

let activeReports = [...(window.REPORTS_DATA || mockReports)];  // Reports still in queue
let hiddenPosts = [];                   // Reports that were hidden (moved here when Hide is clicked)
let escalatedReports = [];             // Reports escalated to system admin (with moderator note)
let moderationHistory = [...(window.HISTORY_DATA || [])];       // Seeded from DB on load
let filteredReports = [];
let currentFilter = 'all';
let pendingEscalateReport = null;       // Report awaiting escalate note
let pendingWarnReport = null;           // Report awaiting warn (UC-M-003)
const MODERATOR_NAME = 'Sara M.';

/**
 * Log a moderation action to history
 * Adds an entry to the moderation history log
 * @param {string} action - Type of action taken (dismiss, hide, escalate, warn)
 * @param {Object} report - The report object
 * @param {string} note - Optional note for escalations
 */
function logModerationAction(action, report, note = '') {
    const typeLabel = report.type === 'post' ? 'Post' : 'User';
    const displayTitle = report.type === 'post' ? `'${report.title}'` : report.title;

    moderationHistory.unshift({
        timestamp: new Date().toISOString(),
        action,
        typeLabel,
        title: displayTitle,
        reporter: report.reporter,
        reason: report.reason,
        moderator: MODERATOR_NAME,
        note
    });
}

/**
 * Render a single hidden post card (no action buttons)
 * Creates HTML for a hidden post in the Hidden Posts view
 * @param {Object} post - Hidden post data
 * @returns {string} HTML string for the card
 */
function renderHiddenPostCard(post) {
    const typeLabel = post.type === 'post' ? 'Post' : 'User';
    const displayTitle = post.type === 'post' ? `'${post.title}'` : post.title;

    return `
        <div class="report-card report-card--hidden" data-id="${post.id}">
            <h3 class="report-card-title">${typeLabel}: ${displayTitle}</h3>
            <p class="report-card-meta">Reported by @${post.reporter} · ${post.time} · Hidden</p>
            <div class="report-card-preview">${post.reason || post.note || "No details provided."}</div>
        </div>
    `;
}

/**
 * Render a single report card with action buttons.
 * Creates HTML for an active report in the Reports Queue.
 * @param {Object} report - Report data
 * @returns {string} HTML string for the report card
 */
function renderReportCard(report) {
    const typeLabel = report.type === 'post' ? 'Post' : 'User';
    const displayTitle = report.type === 'post' ? `'${report.title}'` : report.title;
    const targetUrl = report.type === 'post'
        ? `/posts/${report.targetId}`
        : `/users/profile/${report.targetId}`;

    return `
        <div class="report-card" data-id="${report.id}">
            <h3 class="report-card-title">${typeLabel}: <a href="${targetUrl}" onclick="event.stopPropagation()" style="color:inherit;text-decoration:underline;">${displayTitle}</a></h3>
            <p class="report-card-meta">Reported by @${report.reporter} · ${report.time}</p>
            <div class="report-card-preview">${report.reason || report.note || "No details provided."}</div>
            <div class="report-card-actions">
                <button class="btn-mod btn-warn" data-action="warn" data-id="${report.id}">Warn</button>
                <button class="btn-mod btn-escalate" data-action="escalate" data-id="${report.id}">Escalate</button>
                <button class="btn-mod btn-dismiss" data-action="dismiss" data-id="${report.id}">Dismiss</button>
            </div>
        </div>
    `;
}

/**
 * Render the hidden posts view.
 * Displays all posts that have been hidden by a moderator.
 */
function renderHiddenPosts() {
    const container = document.getElementById('reportCards');
    const emptyState = document.getElementById('emptyState');

    if (hiddenPosts.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        emptyState.querySelector('p').textContent = 'No hidden posts yet. Posts you hide from the Reports Queue will appear here.';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = hiddenPosts.map(renderHiddenPostCard).join('');
}

/**
 * Render a single moderation history entry.
 * Creates HTML for a past moderation action.
 * @param {Object} entry - History entry data
 * @returns {string} HTML string for the history card
 */
function renderHistoryEntry(entry) {
    const actionLabels = {
        dismiss: 'Dismissed',
        hide: 'Hidden',
        escalate: 'Escalated',
        warn: 'Warned'
    };
    const actionLabel = actionLabels[entry.action] || entry.action;
    const timeStr = new Date(entry.timestamp).toLocaleString();
    const noteHtml = entry.note ? `<p class="history-note">Note: ${entry.note}</p>` : '';

    return `
        <div class="report-card history-card">
            <div class="history-header">
                <span class="history-action history-action--${entry.action}">${actionLabel}</span>
                <span class="history-time">${timeStr}</span>
            </div>
            <h3 class="report-card-title">${entry.typeLabel}: ${entry.title}</h3>
            <p class="report-card-meta">Reported by @${entry.reporter} · ${entry.reason} · by ${entry.moderator}</p>
            ${noteHtml}
        </div>
    `;
}

/**
 * Render the moderation history view.
 * Displays all past moderation actions taken.
 */
function renderModerationHistory() {
    const container = document.getElementById('reportCards');
    const emptyState = document.getElementById('emptyState');

    if (moderationHistory.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        emptyState.querySelector('p').textContent = 'No moderation actions yet. Actions you take on reports will appear here.';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = moderationHistory.map(renderHistoryEntry).join('');
}

/**
 * Render all report cards in the Reports Queue.
 * Displays active reports with action buttons.
 */
function renderReports() {
    const container = document.getElementById('reportCards');
    const emptyState = document.getElementById('emptyState');

    if (filteredReports.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        const emptyP = emptyState.querySelector('p');
        if (emptyP) emptyP.textContent = 'No reports match your filter. Great job keeping the community safe!';
        return;
    }

    emptyState.style.display = 'none';
    container.innerHTML = filteredReports.map(renderReportCard).join('');

    // Attach event listeners
    container.querySelectorAll('.report-card-actions button').forEach(btn => {
        btn.addEventListener('click', handleAction);
    });
}

/**
 * Handle action button clicks on report cards.
 * Processes moderation actions (warn, escalate, dismiss).
 * @param {Event} e - Click event
 */
function handleAction(e) {
    const btn = e.target;
    const action = btn.dataset.action;
    const id = parseInt(btn.dataset.id, 10);

    const report = filteredReports.find(r => r.id === id);
    if (!report) return;

    // Escalate: show modal for note, don't remove yet
    if (action === 'escalate') {
        pendingEscalateReport = report;
        document.getElementById('escalateNote').value = '';
        // Clear any previously selected reason
        document.querySelectorAll('input[name="escalateReason"]').forEach(radio => {
            radio.checked = false;
        });
        document.getElementById('escalateModal').classList.add('is-open');
        return;
    }

    // Warn User (UC-M-003): show warning form modal
    if (action === 'warn') {
        openWarnModal(report);
        return;
    }

    // Submit dismiss to backend
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/moderator/reports/${id}/dismiss`;
    document.body.appendChild(form);
    form.submit();
}

/**
 * Complete escalation process with reason and note.
 * Called when the escalate modal's Submit button is clicked.
 */
function completeEscalate() {
    if (!pendingEscalateReport) return;

    // Get selected reason
    const selectedReason = document.querySelector('input[name="escalateReason"]:checked');
    if (!selectedReason) {
        alert('Please select a reason for escalation.');
        return;
    }

    const reason = selectedReason.value;
    const report = pendingEscalateReport;
    const note = document.getElementById('escalateNote').value.trim();

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/moderator/reports/${report.id}/escalate`;

    const reasonInput = document.createElement('input');
    reasonInput.type = 'hidden';
    reasonInput.name = 'escalationReason';
    reasonInput.value = reason;
    form.appendChild(reasonInput);

    const noteInput = document.createElement('input');
    noteInput.type = 'hidden';
    noteInput.name = 'notes';
    noteInput.value = note;
    form.appendChild(noteInput);

    document.body.appendChild(form);
    form.submit();
}

/**
 * Close the escalate modal and reset pending state.
 */
function closeEscalateModal() {
    document.getElementById('escalateModal').classList.remove('is-open');
    pendingEscalateReport = null;
}

/**
 * Open Warn User modal (UC-M-003)
 * Displays warning form with target user/post info
 * @param {Object} report - The report containing the user to warn
 */
function openWarnModal(report) {
    pendingWarnReport = report;

    // Exception Flow 1: User account no longer active
    if (report.userActive === false) {
        alert('This user account is no longer active.');
        pendingWarnReport = null;
        return;
    }

    const targetEl = document.getElementById('warnTargetInfo');
    const typeLabel = report.type === 'post' ? 'Post' : 'User';
    const displayTitle = report.type === 'post' ? `'${report.title}'` : report.title;
    const targetUser = report.author || report.title;
    targetEl.textContent = `Target: ${typeLabel} ${displayTitle} → Warn user ${targetUser}`;

    // Pre-select report reason if it matches a preset (Alternative Flow 1)
    const reasonSelect = document.getElementById('warnReason');
    const reasonMap = { 'spam': 'Spam', 'harassment': 'Harassment', 'inappropriate': 'Inappropriate Content' };
    const presetReason = reasonMap[report.reason.toLowerCase()] || report.reason;
    const reasonMatch = Array.from(reasonSelect.options).find(opt =>
        opt.value && (opt.value === presetReason || opt.value.toLowerCase() === report.reason.toLowerCase())
    );
    reasonSelect.value = reasonMatch ? reasonMatch.value : '';
    document.getElementById('warnMessage').value = '';
    document.getElementById('warnModal').classList.add('is-open');
}

/**
 * Close Warn User modal and reset state
 */
function closeWarnModal() {
    document.getElementById('warnModal').classList.remove('is-open');
    pendingWarnReport = null;
}

/**
 * Complete Warn User flow (UC-M-003)
 * Validates reason, records warning, removes from queue, shows success
 */
function completeWarn() {
    if (!pendingWarnReport) return;

    const reason = document.getElementById('warnReason').value.trim();
    if (!reason) {
        alert('Please select a warning reason.');
        return;
    }

    const message = document.getElementById('warnMessage').value.trim();
    const report = pendingWarnReport;

    // Double-check user active (could have changed)
    if (report.userActive === false) {
        alert('This user account is no longer active.');
        closeWarnModal();
        return;
    }

    const fullNote = message ? `${reason}: ${message}` : reason;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/moderator/reports/${report.id}/warn`;
    const notesInput = document.createElement('input');
    notesInput.type = 'hidden';
    notesInput.name = 'notes';
    notesInput.value = fullNote;
    form.appendChild(notesInput);
    document.body.appendChild(form);
    form.submit();
}


/**
 * Update the report count badge in the sidebar.
 * Shows the number of active reports in the queue.
 */
function updateBadge() {
    const badge = document.getElementById('reportCount');
    if (badge) badge.textContent = activeReports.length;
}

/**
 * Apply a filter to the reports queue and sort results by date submitted (newest first).
 * @param {string} value - Filter value: 'all', 'post', 'user', or a reason string (e.g. 'spam')
 */
function applyFilter(value) {
    currentFilter = value;

    if (value === 'all') {
        filteredReports = [...activeReports];
    } else if (value === 'post' || value === 'user') {
        filteredReports = activeReports.filter(r => r.type === value);
    } else {
        // Normalize filter value and report reason for comparison
        // e.g. "inappropriate" matches "Inappropriate Content", "inappropriate content"
        const filterNorm = value.toLowerCase().replace(/\s+/g, '');
        filteredReports = activeReports.filter(r => {
            const reasonNorm = (r.reason || '').toLowerCase().replace(/\s+/g, '');
            return reasonNorm === filterNorm || reasonNorm.startsWith(filterNorm);
        });
    }

    // Sort by date submitted (newest first)
    filteredReports.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

    renderReports();
    updateBadge();
}

/**
 * Initialize sidebar navigation.
 * Sets up click handlers for switching between Reports Queue, History, and other views.
 */
function initSidebar() {
    document.querySelectorAll('.mod-nav-item').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.mod-nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const view = this.dataset.view;
            if (view === 'reports') {
                document.querySelector('.mod-content-header h1').textContent = 'Reports Queue';
                document.getElementById('reportFilter').parentElement.style.display = 'flex';
                document.getElementById('reportCards').style.display = 'flex';
                document.getElementById('reportCards').className = 'report-cards';
                renderReports();
            } else if (view === 'history') {
                document.querySelector('.mod-content-header h1').textContent = 'Moderation History';
                document.getElementById('reportFilter').parentElement.style.display = 'none';
                document.getElementById('reportCards').style.display = 'flex';
                document.getElementById('reportCards').className = 'report-cards';
                renderModerationHistory();
            } else {
                // Placeholder for other views
                document.querySelector('.mod-content-header h1').textContent = view.charAt(0).toUpperCase() + view.slice(1);
                document.getElementById('reportFilter').parentElement.style.display = 'none';
                document.getElementById('reportCards').innerHTML = '<p style="color: var(--muted); padding: 2rem;">This view is coming soon.</p>';
                document.getElementById('reportCards').className = 'report-cards';
                document.getElementById('emptyState').style.display = 'none';
            }
        });
    });
}

/**
 * Initialize the moderation dashboard on DOM ready.
 * Populates the reports queue, wires up modal controls and filter/sidebar events.
 */
document.addEventListener('DOMContentLoaded', () => {
    applyFilter('all');  // Populate filteredReports from activeReports
    initSidebar();

    document.getElementById('reportFilter').addEventListener('change', (e) => {
        applyFilter(e.target.value);
    });

    // Escalate modal
    document.getElementById('escalateCancel').addEventListener('click', closeEscalateModal);
    document.getElementById('escalateSubmit').addEventListener('click', completeEscalate);

    // Warn User modal (UC-M-003)
    document.getElementById('warnCancel').addEventListener('click', closeWarnModal);
    document.getElementById('warnSubmit').addEventListener('click', completeWarn);

    // Preset message populates the message textarea
    document.getElementById('warnPreset').addEventListener('change', function() {
        if (this.value) {
            document.getElementById('warnMessage').value = this.value;
            this.value = '';
        }
    });

    // Modal backdrop clicks (close the containing modal)
    document.addEventListener('click', (e) => {
        if (!e.target.classList.contains('mod-modal-backdrop')) return;
        const modal = e.target.closest('.mod-modal');
        if (!modal) return;
        modal.classList.remove('is-open');
        if (modal.id === 'warnModal') pendingWarnReport = null;
        if (modal.id === 'escalateModal') pendingEscalateReport = null;
    });
});
