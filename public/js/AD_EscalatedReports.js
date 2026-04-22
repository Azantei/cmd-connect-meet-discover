/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   ADMIN ESCALATED REPORTS JAVASCRIPT
   Handles escalated report display and actions
========================================== */

// ==========================================
// STATE MANAGEMENT
// ==========================================

let reports = []; // All reports data
let filteredReports = []; // Filtered results
let currentReportId = null; // Currently selected report
let pendingAction = null; // Pending action for confirmation

// ==========================================
// SAMPLE DATA
// ==========================================

function generateSampleReports() {
    return [
        {
            id: 1,
            type: 'post',
            title: 'Free Concert Downtown',
            reportedUser: '@concert_spammer',
            escalatedBy: '@moderator',
            timeAgo: '3 hrs ago',
            originalReason: 'Spam',
            moderatorNotes: 'User has been posting this same concert advertisement across multiple unrelated community groups. This appears to be commercial spam rather than genuine community engagement. Multiple users have reported it. Escalating for potential ban consideration.',
            contentPreview: 'FREE CONCERT THIS WEEKEND!!! Everyone come downtown for amazing music! Click here for tickets: [...]. Tell all your friends! Share everywhere!',
            status: 'open'
        },
        {
            id: 2,
            type: 'user',
            title: '@toxic_user99',
            reportedUser: '@toxic_user99',
            escalatedBy: '@sara_mod',
            timeAgo: '6 hrs ago',
            originalReason: 'Harassment',
            moderatorNotes: 'This user has a pattern of leaving hostile comments on community posts. After receiving a warning yesterday, they continued aggressive behavior targeting specific community members. Their recent comments include personal attacks and inflammatory language. Recommend ban.',
            contentPreview: 'Recent comment: "You people are all idiots. Why don\'t you just leave this neighborhood if you don\'t like it..." [Multiple similar comments found]',
            status: 'open'
        },
        {
            id: 3,
            type: 'post',
            title: 'Neighborhood Watch Sign-Up',
            reportedUser: '@concerned_neighbor',
            escalatedBy: '@moderator',
            timeAgo: '2 days ago',
            originalReason: 'Privacy concern',
            moderatorNotes: 'Post includes a sign-up form that requests home addresses and personal schedules. While the intent appears genuine, the data collection method raises privacy concerns. Seeking admin guidance on whether to remove or allow with modifications.',
            contentPreview: 'Join our neighborhood watch program! Please fill out this form with your name, address, phone number, and typical daily schedule so we can coordinate patrols effectively...',
            status: 'open'
        },
        {
            id: 4,
            type: 'post',
            title: 'Lost Dog - Please Help',
            reportedUser: '@worried_owner',
            escalatedBy: '@john_mod',
            timeAgo: '1 week ago',
            originalReason: 'False report',
            moderatorNotes: 'Multiple users reported this as suspicious, claiming they saw the same post in other cities. However, after investigation, this appears to be a legitimate lost pet post. The user is genuinely distressed. Escalating to dismiss the false reports.',
            contentPreview: 'Has anyone seen my golden retriever Max? He went missing yesterday near Oak Park. Brown collar, very friendly. Please contact me if you have any information...',
            status: 'resolved'
        }
    ];
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    reports = window.ADMIN_ESCALATED || generateSampleReports();
    filteredReports = [...reports];

    renderReports();
    setupEventListeners();
});

// ==========================================
// RENDER REPORTS
// ==========================================

function renderReports() {
    const container = document.getElementById('reportsList');
    
    // Clear container
    container.innerHTML = '';
    
    // Populate reports
    if (filteredReports.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--text-muted);">No escalated reports found</div>';
        return;
    }
    
    filteredReports.forEach(report => {
        const card = document.createElement('div');
        card.className = `report-card ${report.status}`;
        
        // Only make unresolved reports clickable
        if (report.status === 'open') {
            card.onclick = () => openReportDetail(report.id);
        }
        
        const titlePrefix = report.type === 'post' ? 'Post: ' : 'User: ';
        const statusBadge = `<span class="status-badge ${report.status}">${report.status}</span>`;
        const targetUrl = report.type === 'post'
            ? `/posts/${report.targetId}`
            : `/users/profile/${report.targetId}`;

        const notesPreview = report.moderatorNotes
            ? (report.moderatorNotes.substring(0, 100) + (report.moderatorNotes.length > 100 ? '...' : ''))
            : 'No moderator notes.';

        card.innerHTML = `
            <div class="report-header">
                <div class="report-title">${titlePrefix}<a href="${targetUrl}" onclick="event.stopPropagation()" style="color:inherit;text-decoration:underline;">'${report.title}'</a> ${statusBadge}</div>
                <div class="report-meta">
                    <span>Escalated by ${report.escalatedBy}</span>
                    <span class="separator">·</span>
                    <span>${report.timeAgo}</span>
                </div>
            </div>
            <div class="moderator-notes">${notesPreview}</div>
        `;
        
        container.appendChild(card);
    });
}

// ==========================================
// FILTER FUNCTIONALITY
// ==========================================

function applyFilter() {
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredReports = reports.filter(report => {
        if (statusFilter === 'all') return true;
        return report.status === statusFilter;
    });
    
    renderReports();
}

// ==========================================
// MODAL FUNCTIONS
// ==========================================

function openReportDetail(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report || report.status !== 'open') return;

    currentReportId = reportId;

    // Populate modal content
    const titlePrefix = report.type === 'post' ? 'Post: ' : 'User: ';
    document.getElementById('modalReportTitle').textContent = `${titlePrefix}"${report.title}"`;

    const subjectLabel = report.type === 'post' ? 'Reported Post' : 'Reported User';
    const modalTargetUrl = report.type === 'post'
        ? `/posts/${report.targetId}`
        : `/users/profile/${report.targetId}`;
    document.getElementById('modalReportMeta').innerHTML = `
        <span><strong>${subjectLabel}:</strong> <a href="${modalTargetUrl}" target="_blank" style="color:hsl(20,90%,55%);text-decoration:underline;">${report.title} ↗</a></span>
        <span><strong>Reported by:</strong> ${report.reporterName}</span>
        <span><strong>Escalated by:</strong> ${report.escalatedBy}</span>
        <span><strong>Time:</strong> ${report.timeAgo}</span>
        <span><strong>Original Reason:</strong> ${report.originalReason}</span>
    `;

    document.getElementById('modalModeratorNotes').textContent = report.moderatorNotes;
    document.getElementById('modalContentPreview').textContent = report.contentPreview;

    // Disable Ban User button if the target user is already banned
    const banBtn = document.getElementById('btnBanUser');
    if (report.isBanned) {
        banBtn.disabled = true;
        banBtn.title = 'This user is already banned.';
        banBtn.textContent = 'Already Banned';
    } else {
        banBtn.disabled = false;
        banBtn.title = '';
        banBtn.textContent = 'Ban User';
    }

    // Remove Post only applies to post-type reports
    const removeBtn = document.getElementById('btnRemoveContent');
    if (report.type === 'post') {
        removeBtn.style.display = '';
    } else {
        removeBtn.style.display = 'none';
    }

    // Show modal
    document.getElementById('reportDetailModal').classList.add('active');
}

function closeReportDetail() {
    document.getElementById('reportDetailModal').classList.remove('active');
    currentReportId = null;
}

function showConfirmation(message, action) {
    pendingAction = action;
    document.getElementById('confirmationMessage').textContent = message;
    document.getElementById('confirmationModal').classList.add('active');
    
    // Set up confirm button
    const confirmBtn = document.getElementById('confirmActionBtn');
    confirmBtn.onclick = () => {
        if (pendingAction) {
            pendingAction();
        }
        closeConfirmation();
    };
}

function closeConfirmation() {
    document.getElementById('confirmationModal').classList.remove('active');
    pendingAction = null;
}

// ==========================================
// ACTION HANDLERS
// ==========================================

function _submitPost(action) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    document.body.appendChild(form);
    form.submit();
}

function handleBanUser() {
    const report = reports.find(r => r.id === currentReportId);
    if (!report) return;

    if (report.isBanned) {
        alert('This user is already banned.');
        return;
    }

    const message = `Are you sure you want to ban this user? This will permanently remove their access to the platform.`;

    showConfirmation(message, () => {
        _submitPost(`/admin/escalated/${report.id}/ban`);
    });
}

function handleRemoveContent() {
    const report = reports.find(r => r.id === currentReportId);
    if (!report) return;

    const message = 'Are you sure you wish to remove?';

    showConfirmation(message, () => {
        _submitPost(`/admin/escalated/${report.id}/remove`);
    });
}

function handleDismissReport() {
    const report = reports.find(r => r.id === currentReportId);
    if (!report) return;

    const message = 'Are you sure you want to dismiss this report? It will be marked as resolved without further action.';

    showConfirmation(message, () => {
        _submitPost(`/admin/escalated/${report.id}/dismiss`);
    });
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', applyFilter);
    
    // Close modals when clicking outside
    window.onclick = (event) => {
        const reportModal = document.getElementById('reportDetailModal');
        const confirmModal = document.getElementById('confirmationModal');
        
        if (event.target === reportModal) {
            closeReportDetail();
        }
        if (event.target === confirmModal) {
            closeConfirmation();
        }
    };
    
    // Close modals with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeReportDetail();
            closeConfirmation();
        }
    });
}
