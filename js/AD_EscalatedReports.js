/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor.
  Logs and further project documents can be found at:
  <insert link to our Google Drive for the project here>.
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

// ==========================================
// SAMPLE DATA
// ==========================================

function generateSampleReports() {
    return [
        {
            id: 1,
            type: 'post',
            title: 'Free Concert Downtown',
            escalatedBy: '@moderator',
            timeAgo: '3 hrs ago',
            originalReason: 'Spam',
            moderatorNotes: '...',
            contentPreview: 'Reported content preview',
            status: 'open'
        },
        {
            id: 2,
            type: 'user',
            title: '@toxic_user99',
            escalatedBy: '@sara_mod',
            timeAgo: '6 hrs ago',
            originalReason: 'Harassment',
            moderatorNotes: '...',
            contentPreview: 'Reported content preview',
            status: 'open'
        },
        {
            id: 3,
            type: 'post',
            title: 'Neighborhood Watch Sign-Up',
            escalatedBy: '@moderator',
            timeAgo: '2 days ago',
            originalReason: 'Privacy concern',
            moderatorNotes: '...',
            contentPreview: 'Reported content preview',
            status: 'open'
        }
    ];
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Load sample data
    reports = generateSampleReports();
    filteredReports = [...reports];
    
    // Initialize UI
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
        card.className = 'report-card';
        
        const titlePrefix = report.type === 'post' ? 'Post: ' : 'User: ';
        
        card.innerHTML = `
            <div class="report-header">
                <div class="report-title">${titlePrefix}'${report.title}'</div>
                <div class="report-meta">
                    <span>Escalated by ${report.escalatedBy}</span>
                    <span class="separator">·</span>
                    <span>${report.timeAgo}</span>
                    <span class="separator">·</span>
                    <span>${report.originalReason}</span>
                </div>
            </div>
            
            <div class="moderator-notes">
                Moderator's notes: '${report.moderatorNotes}' (quoted escalation notes)
            </div>
            
            <div class="content-preview">
                ${report.contentPreview}
            </div>
            
            <div class="report-actions">
                <button class="report-action-btn remove-post" onclick="removePost(${report.id})">Remove Post</button>
                <button class="report-action-btn ban-user" onclick="banUser(${report.id})">Ban User</button>
                <button class="report-action-btn dismiss" onclick="dismissReport(${report.id})">Dismiss</button>
            </div>
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
// ACTION HANDLERS
// ==========================================

function removePost(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    if (confirm(`Are you sure you want to remove the post "${report.title}"?`)) {
        console.log('Removing post:', reportId);
        // Update report status
        report.status = 'resolved';
        alert('Post removed successfully!');
        applyFilter();
    }
}

function banUser(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    if (confirm(`Are you sure you want to BAN the user associated with "${report.title}"? This is a serious action.`)) {
        console.log('Banning user from report:', reportId);
        // Update report status
        report.status = 'resolved';
        alert('User banned successfully!');
        applyFilter();
    }
}

function dismissReport(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    if (confirm('Dismiss this escalated report? This will mark it as resolved without taking action.')) {
        console.log('Dismissing report:', reportId);
        // Update report status
        report.status = 'resolved';
        alert('Report dismissed!');
        applyFilter();
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', applyFilter);
}
