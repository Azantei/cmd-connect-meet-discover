/* ==========================================
   C.M.D. - MODERATION DASHBOARD
   Mock data, report rendering, sidebar & filter logic
========================================== */

// Mock reports data
const mockReports = [
    {
        id: 1,
        type: 'post',
        title: "Free Concert Downtown",
        reporter: "user",
        time: "2 hrs ago",
        reason: "Spam",
        note: ""
    },
    {
        id: 2,
        type: 'user',
        title: "@toxic_user99",
        reporter: "member",
        time: "5 hrs ago",
        reason: "Harassment",
        note: ""
    },
    {
        id: 3,
        type: 'post',
        title: "Neighborhood Watch Sign-Up",
        reporter: "curious",
        time: "1 day ago",
        reason: "Inappropriate",
        note: ""
    },
    {
        id: 4,
        type: 'post',
        title: "Coffee Meetup at Central Park",
        reporter: "community_member",
        time: "3 hrs ago",
        reason: "Spam",
        note: ""
    },
    {
        id: 5,
        type: 'user',
        title: "@spammer123",
        reporter: "moderator_help",
        time: "6 hrs ago",
        reason: "Spam",
        note: ""
    },
    {
        id: 6,
        type: 'post',
        title: "Yoga in the Park - Saturday",
        reporter: "local_user",
        time: "12 hrs ago",
        reason: "Inappropriate",
        note: ""
    },
    {
        id: 7,
        type: 'post',
        title: "Lost Dog - Please Help",
        reporter: "concerned",
        time: "1 day ago",
        reason: "Spam",
        note: ""
    }
];

let activeReports = [...mockReports];  // Reports still in queue
let hiddenPosts = [];                   // Reports that were hidden (moved here when Hide is clicked)
let escalatedReports = [];             // Reports escalated to system admin (with moderator note)
let moderationHistory = [];             // Log of all moderation actions (dismiss, hide, escalate, warn)
let filteredReports = [];
let currentFilter = 'all';
let pendingEscalateReport = null;       // Report awaiting escalate note
const MODERATOR_NAME = 'Sara M.';

// Log a moderation action to history
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

// Render a single hidden post card (no action buttons)
function renderHiddenPostCard(post) {
    const typeLabel = post.type === 'post' ? 'Post' : 'User';
    const displayTitle = post.type === 'post' ? `'${post.title}'` : post.title;

    return `
        <div class="report-card report-card--hidden" data-id="${post.id}">
            <h3 class="report-card-title">${typeLabel}: ${displayTitle}</h3>
            <p class="report-card-meta">Reported by @${post.reporter} · ${post.time} · ${post.reason} · Hidden</p>
            <div class="report-card-preview">${post.note || "Reporter's note / quoted content preview"}</div>
        </div>
    `;
}

// Render a single report card (with action buttons)
function renderReportCard(report) {
    const typeLabel = report.type === 'post' ? 'Post' : 'User';
    const displayTitle = report.type === 'post' ? `'${report.title}'` : report.title;
    const hideButton = report.type === 'post'
        ? `<button class="btn-mod btn-hide" data-action="hide" data-id="${report.id}">Hide</button>`
        : '';

    return `
        <div class="report-card" data-id="${report.id}">
            <h3 class="report-card-title">${typeLabel}: ${displayTitle}</h3>
            <p class="report-card-meta">Reported by @${report.reporter} · ${report.time} · ${report.reason}</p>
            <div class="report-card-preview">${report.note || "Reporter's note / quoted content preview"}</div>
            <div class="report-card-actions">
                <button class="btn-mod btn-warn" data-action="warn" data-id="${report.id}">Warn</button>
                ${hideButton}
                <button class="btn-mod btn-escalate" data-action="escalate" data-id="${report.id}">Escalate</button>
                <button class="btn-mod btn-dismiss" data-action="dismiss" data-id="${report.id}">Dismiss</button>
            </div>
        </div>
    `;
}

// Render hidden posts view
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

// Render a single moderation history entry
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

// Render moderation history view
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

// Render all report cards
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

// Handle action button clicks
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
        document.getElementById('escalateModal').classList.add('is-open');
        return;
    }

    // Remove from active queue
    activeReports = activeReports.filter(r => r.id !== id);

    // If Hide was clicked, move to hidden posts
    if (action === 'hide') {
        hiddenPosts.unshift({ ...report, hiddenAt: new Date().toISOString() });
    }

    // Log to moderation history
    logModerationAction(action, report);

    applyFilter(currentFilter);  // Re-apply filter to refresh display
    updateBadge();

    console.log(`Moderator action: ${action} on report #${id}`);
}

// Complete escalate (called when modal Submit is clicked)
function completeEscalate() {
    if (!pendingEscalateReport) return;

    const note = document.getElementById('escalateNote').value.trim();
    const report = pendingEscalateReport;

    activeReports = activeReports.filter(r => r.id !== report.id);
    escalatedReports.unshift({
        ...report,
        escalatedAt: new Date().toISOString(),
        moderatorNote: note || '(No note provided)'
    });

    // Log to moderation history
    logModerationAction('escalate', report, note);

    closeEscalateModal();
    pendingEscalateReport = null;
    applyFilter(currentFilter);
    updateBadge();

    console.log(`Escalated report #${report.id} with note:`, note || '(none)');
}

// Close escalate modal
function closeEscalateModal() {
    document.getElementById('escalateModal').classList.remove('is-open');
    pendingEscalateReport = null;
}

// Update badge count
function updateBadge() {
    const badge = document.getElementById('reportCount');
    if (badge) badge.textContent = filteredReports.length;
}

// Apply filter (filters active reports in queue)
function applyFilter(value) {
    currentFilter = value;

    if (value === 'all') {
        filteredReports = [...activeReports];
    } else if (value === 'post' || value === 'user') {
        filteredReports = activeReports.filter(r => r.type === value);
    } else {
        filteredReports = activeReports.filter(r => r.reason.toLowerCase() === value.toLowerCase());
    }

    renderReports();
    updateBadge();
}

// Sidebar navigation (switch active view)
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
            } else if (view === 'hidden') {
                document.querySelector('.mod-content-header h1').textContent = 'Hidden Posts';
                document.getElementById('reportFilter').parentElement.style.display = 'none';
                document.getElementById('reportCards').style.display = 'flex';
                document.getElementById('reportCards').className = 'report-cards';
                renderHiddenPosts();
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    applyFilter('all');  // Populate filteredReports from activeReports
    initSidebar();

    document.getElementById('reportFilter').addEventListener('change', (e) => {
        applyFilter(e.target.value);
    });

    // Escalate modal
    document.getElementById('escalateCancel').addEventListener('click', closeEscalateModal);
    document.getElementById('escalateSubmit').addEventListener('click', completeEscalate);
    document.querySelector('.mod-modal-backdrop').addEventListener('click', closeEscalateModal);
});
