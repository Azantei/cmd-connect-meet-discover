/*
  Created for use for C.M.D. with the assistance of AI tools:
  Claude 4.6, Co-Pilot using Claude Somnet 4.5, and Cursor.
  Logs and further project documents can be found at:
  <insert link to our Google Drive for the project here>.
*/
/* ==========================================
   ADMIN USER MANAGEMENT JAVASCRIPT
   Handles user data display, filtering, and search
========================================== */

// ==========================================
// STATE MANAGEMENT
// ==========================================

let users = []; // All users data
let filteredUsers = []; // Filtered results

// ==========================================
// SAMPLE DATA
// ==========================================

function generateSampleUsers() {
    return [
        {
            id: 1,
            firstName: 'Alex',
            lastName: 'Johnson',
            email: 'alex@email.com',
            role: 'Member',
            status: 'active',
            joinDate: 'Jan 26',
            initials: 'AJ',
            avatarColor: '#D2691E'
        },
        {
            id: 2,
            firstName: 'Sara',
            lastName: 'Mod',
            email: 'sara@email.com',
            role: 'Mod',
            status: 'active',
            joinDate: 'Nov 25',
            initials: 'SM',
            avatarColor: '#C85A54'
        },
        {
            id: 3,
            firstName: 'toxic_user99',
            lastName: '',
            email: 'tx@email.com',
            role: 'Member',
            status: 'flagged',
            joinDate: 'Feb 26',
            initials: 'TX',
            avatarColor: '#CD853F'
        },
        {
            id: 4,
            firstName: 'banned_user',
            lastName: '',
            email: 'bn@email.com',
            role: 'Member',
            status: 'banned',
            joinDate: 'Dec 25',
            initials: 'BN',
            avatarColor: '#A0522D'
        },
        // Additional sample users
        {
            id: 5,
            firstName: 'Jordan',
            lastName: 'Smith',
            email: 'jordan@email.com',
            role: 'Member',
            status: 'active',
            joinDate: 'Mar 01',
            initials: 'JS',
            avatarColor: '#8B4513'
        },
        {
            id: 6,
            firstName: 'Taylor',
            lastName: 'Admin',
            email: 'taylor@email.com',
            role: 'Admin',
            status: 'active',
            joinDate: 'Jan 15',
            initials: 'TA',
            avatarColor: '#6B4423'
        },
        {
            id: 7,
            firstName: 'Casey',
            lastName: 'Lee',
            email: 'casey@email.com',
            role: 'Member',
            status: 'flagged',
            joinDate: 'Feb 18',
            initials: 'CL',
            avatarColor: '#B87333'
        }
    ];
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Load sample data
    users = generateSampleUsers();
    filteredUsers = [...users];
    
    // Initialize UI
    updateStatistics();
    renderUsers();
    setupEventListeners();
});

// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {
    const totalUsers = 2847;
    const activePosts = 391;
    const reports = 7;
    
    document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
    document.getElementById('activePosts').textContent = activePosts.toLocaleString();
    document.getElementById('reports').textContent = reports;
}

// ==========================================
// RENDER USERS TABLE
// ==========================================

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    
    // Clear table
    tbody.innerHTML = '';
    
    // Populate table
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No users found</td></tr>';
        return;
    }
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        
        // Build user cell with avatar
        const fullName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
        const userCell = `
            <div class="user-cell">
                <div class="user-avatar" style="background-color: ${user.avatarColor}">
                    ${user.initials}
                </div>
                <div class="user-info">
                    <div class="user-name">${fullName}</div>
                    <div class="user-email">${user.email}</div>
                </div>
            </div>
        `;
        
        // Build action buttons based on status
        let actionButtons = '';
        if (user.status === 'active') {
            if (user.role === 'Member') {
                actionButtons = `
                    <button class="action-btn">Promote</button>
                    <button class="action-btn danger">Ban</button>
                `;
            } else if (user.role === 'Mod') {
                actionButtons = `
                    <button class="action-btn">Demote</button>
                    <button class="action-btn danger">Ban</button>
                `;
            } else if (user.role === 'Admin') {
                actionButtons = `
                    <button class="action-btn">Demote</button>
                `;
            }
        } else if (user.status === 'flagged') {
            actionButtons = `
                <button class="action-btn danger">Ban</button>
            `;
        } else if (user.status === 'banned') {
            actionButtons = `
                <button class="action-btn">Unban</button>
            `;
        }
        
        row.innerHTML = `
            <td>${userCell}</td>
            <td>${user.role}</td>
            <td><span class="status-badge ${user.status}">${capitalizeFirst(user.status)}</span></td>
            <td>${user.joinDate}</td>
            <td><div class="action-buttons">${actionButtons}</div></td>
        `;
        
        tbody.appendChild(row);
    });
}

// ==========================================
// SEARCH FUNCTIONALITY
// ==========================================

function applySearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        
        return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
    
    renderUsers();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    searchBtn.addEventListener('click', applySearch);
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            applySearch();
        }
    });
    
    // Real-time search as user types (optional - can be removed if not desired)
    searchInput.addEventListener('input', applySearch);

    // Action button clicks (event delegation)
    document.getElementById('usersTableBody').addEventListener('click', (e) => {
        const btn = e.target.closest('button.action-btn');
        if (!btn) return;

        const row = btn.closest('tr');
        const userEmail = row?.querySelector('.user-email')?.textContent;
        const user = users.find(u => u.email === userEmail);
        if (!user) return;

        const fullName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;

        if (btn.textContent === 'Ban') {
            if (user.status === 'banned') {
                alert('This user is already banned.');
                return;
            }
            if (confirm(`Are you sure you want to BAN the user associated with "${fullName}"? This is a serious action.`)) {
                user.status = 'banned';
                renderUsers();
                alert('User banned successfully!');
            }
        } else if (btn.textContent === 'Unban') {
            if (user.status !== 'banned') {
                alert('This user is not banned.');
                return;
            }
            if (confirm(`Are you sure you want to UNBAN the user associated with "${fullName}"? They will be able to log in again.`)) {
                user.status = 'active';
                renderUsers();
                alert('User unbanned successfully!');
            }
        } else if (btn.textContent === 'Promote') {
            if (user.role === 'Mod') {
                alert('This user is already a moderator.');
                return;
            }
            if (user.status !== 'active') {
                alert('Only active users can be promoted.');
                return;
            }
            if (confirm(`Are you sure you want to promote "${fullName}" to Moderator? They will gain access to moderation tools.`)) {
                user.role = 'Mod';
                renderUsers();
                alert('User promoted to moderator successfully!');
            }
        } else if (btn.textContent === 'Demote') {
            if (user.role === 'Member') {
                alert('This user is not a moderator.');
                return;
            }
            const targetRole = user.role === 'Admin' ? 'Moderator' : 'Member';
            if (confirm(`Are you sure you want to demote "${fullName}"? They will lose access to moderation tools and become a ${targetRole}.`)) {
                user.role = user.role === 'Admin' ? 'Mod' : 'Member';
                renderUsers();
                alert('User demoted successfully!');
            }
        }
    });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
