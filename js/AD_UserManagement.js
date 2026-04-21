/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor Composer 1.5.
  Logs and further project documents can be found at:
  https://drive.google.com/drive/folders/1UOnmlC70OxJRkkYt0ohzdkyXL9j82hFQ
*/
/* ==========================================
   ADMIN USER MANAGEMENT JAVASCRIPT
   Handles user data display, filtering, and search
========================================== */

let users = [];
let filteredUsers = [];

// Pending IDs for modal confirmations
let pendingBanId = null;
let pendingUnbanId = null;
let pendingPromoteId = null;

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    users = window.ADMIN_USERS || [];
    filteredUsers = [...users];
    renderUsers();
    setupEventListeners();
    setupModalButtons();
});

// ==========================================
// RENDER USERS TABLE
// ==========================================

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);">No users found</td></tr>';
        return;
    }

    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        const fullName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
        const safeName = fullName.replace(/"/g, '&quot;');

        const userCell = `
            <div class="user-cell">
                <div class="user-avatar" style="background-color:${user.avatarColor}">${user.initials}</div>
                <div class="user-info">
                    <div class="user-name">${fullName}</div>
                    <div class="user-email">${user.email}</div>
                </div>
            </div>`;

        let actionButtons = '';
        if (user.status === 'banned') {
            actionButtons = `<button class="action-btn" data-action="unban" data-id="${user.id}" data-name="${safeName}">Unban</button>`;
        } else if (user.role === 'Member') {
            actionButtons = `
                <button class="action-btn" data-action="promote" data-id="${user.id}" data-name="${safeName}">Promote</button>
                <button class="action-btn danger" data-action="ban" data-id="${user.id}" data-name="${safeName}">Ban</button>`;
        } else if (user.role === 'Mod') {
            actionButtons = `
                <button class="action-btn" data-action="demote" data-id="${user.id}" data-name="${safeName}">Demote</button>
                <button class="action-btn danger" data-action="ban" data-id="${user.id}" data-name="${safeName}">Ban</button>`;
        } else if (user.role === 'Admin') {
            actionButtons = `<button class="action-btn" data-action="demote" data-id="${user.id}" data-name="${safeName}">Demote</button>`;
        }

        row.innerHTML = `
            <td>${userCell}</td>
            <td>${user.role}</td>
            <td><span class="status-badge ${user.status}">${capitalizeFirst(user.status)}</span></td>
            <td>${user.joinDate}</td>
            <td><div class="action-buttons">${actionButtons}</div></td>`;

        tbody.appendChild(row);
    });
}

// ==========================================
// FORM SUBMISSION HELPER
// ==========================================

function submitAction(path) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = path;
    document.body.appendChild(form);
    form.submit();
}

// ==========================================
// MODAL HELPERS
// ==========================================

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function openBanModal(userId, userName) {
    pendingBanId = userId;
    document.getElementById('banModalMsg').textContent =
        `Are you sure you want to ban "${userName}"? They will be unable to log in until unbanned.`;
    openModal('banModal');
}

function closeBanModal() {
    pendingBanId = null;
    closeModal('banModal');
}

function openUnbanModal(userId, userName) {
    pendingUnbanId = userId;
    document.getElementById('unbanModalMsg').textContent =
        `Unban "${userName}"? They will be able to log in again.`;
    openModal('unbanModal');
}

function closeUnbanModal() {
    pendingUnbanId = null;
    closeModal('unbanModal');
}

function openPromoteModal(userId, userName) {
    pendingPromoteId = userId;
    document.getElementById('promoteModalMsg').textContent =
        `Promote "${userName}" to Moderator? They will gain access to moderation tools.`;
    openModal('promoteModal');
}

function closePromoteModal() {
    pendingPromoteId = null;
    closeModal('promoteModal');
}

// ==========================================
// MODAL CONFIRM BUTTON WIRING
// ==========================================

function setupModalButtons() {
    document.getElementById('banConfirmBtn').addEventListener('click', () => {
        if (!pendingBanId) return;
        submitAction(`/admin/users/${pendingBanId}/ban`);
    });

    document.getElementById('unbanConfirmBtn').addEventListener('click', () => {
        if (!pendingUnbanId) return;
        submitAction(`/admin/users/${pendingUnbanId}/unban`);
    });

    document.getElementById('promoteConfirmBtn').addEventListener('click', () => {
        if (!pendingPromoteId) return;
        submitAction(`/admin/users/${pendingPromoteId}/promote`);
    });
}

// ==========================================
// SEARCH
// ==========================================

function applySearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(searchTerm) || user.email.toLowerCase().includes(searchTerm);
    });
    renderUsers();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    document.querySelector('.search-btn').addEventListener('click', applySearch);
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') applySearch(); });
    searchInput.addEventListener('input', applySearch);

    document.getElementById('usersTableBody').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const { action, id, name } = btn.dataset;

        if (action === 'ban')     openBanModal(id, name);
        else if (action === 'unban')   openUnbanModal(id, name);
        else if (action === 'promote') openPromoteModal(id, name);
        else if (action === 'demote') {
            if (confirm(`Demote "${name}"? They will lose moderator access.`)) {
                submitAction(`/admin/users/${id}/demote`);
            }
        }
    });
}

// ==========================================
// UTILITY
// ==========================================

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
