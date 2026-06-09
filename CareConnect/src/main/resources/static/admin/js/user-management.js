import { CONFIG, apiUtils } from '../../config.js';

// Store users globally for client-side filtering
let allUsers = [];

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Admin Access
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
        alert("Access Denied.");
        window.location.href = "../login.html";
        return;
    }

    // 2. Load Users from Backend
    loadUsers();

    // 3. Setup Filter Buttons
    const filterButtons = document.querySelectorAll('.filter-buttons .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('primary')) {
                applyFilters();
            } else {
                resetFilters();
            }
        });
    });

    // 4. Handle "Add New User" (Redirect to register for now)
    const addUserButton = document.querySelector('.users-header .btn.primary');
    if (addUserButton) {
        addUserButton.addEventListener('click', function() {
            // In a real app, this might open a modal. For now, we can redirect or show alert.
            // window.location.href = '../register.html'; 
            alert("To add a user, please use the public registration page or implement an admin creation form.");
        });
    }
});

// --- Fetch Users ---
async function loadUsers() {
    const container = document.getElementById('userListContainer');
    if (!container) return;

    try {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Loading users...</p>';

        // Endpoint: /api/admin/users
        const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ADMIN.USERS}`;
        allUsers = await apiUtils.get(url);

        renderUsers(allUsers);

    } catch (error) {
        console.error("Error loading users:", error);
        container.innerHTML = '<p style="color:red; text-align:center;">Failed to load users.</p>';
    }
}

// --- Render List ---
function renderUsers(users) {
    const container = document.getElementById('userListContainer');
    container.innerHTML = '';

    if (!users || users.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">No users found.</p>';
        return;
    }

    users.forEach(user => {
        // Initials for Avatar
        const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();

        // Status Styling
        const status = user.status || 'Active';
        let statusClass = 'active';
        if (status === 'Suspended') statusClass = 'suspended';
        else if (status === 'Inactive') statusClass = 'inactive';

        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `
            <div class="user-header">
                <div class="user-avatar">${initials}</div>
                <div class="user-meta">
                    <h3>${user.firstName} ${user.lastName}</h3>
                    <span class="user-role ${user.role}">${(user.role || 'User').toUpperCase()}</span>
                </div>
            </div>
            <p class="user-email">${user.email}</p>
            <div class="user-details">
                <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${user.phone || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="user-status ${statusClass}">${status}</span>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn secondary small" onclick="alert('View details for ID: ${user.id}')">View</button>
                ${status === 'Suspended'
            ? `<button class="btn primary small" onclick="changeUserStatus(${user.id}, 'activate')">Activate</button>`
            : `<button class="btn secondary small" style="color: #e74c3c; border-color: #e74c3c;" onclick="changeUserStatus(${user.id}, 'suspend')">Suspend</button>`
        }
            </div>
        `;
        container.appendChild(div);
    });
}

// --- Status Management (Global Scope for onclick) ---
window.changeUserStatus = async function(userId, action) {
    if(!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
        let url;
        // Use endpoints defined in config.js (or construct manually if not defined yet)
        if (action === 'suspend') {
            url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ADMIN.SUSPEND_USER(userId)}`;
        } else {
            url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ADMIN.ACTIVATE_USER(userId)}`;
        }

        await apiUtils.post(url, {});

        alert(`User ${action}ed successfully.`);
        loadUsers(); // Reload list to show changes

    } catch (error) {
        console.error(`Error ${action}ing user:`, error);
        alert(`Failed to ${action} user.`);
    }
};

// --- Client-Side Filtering ---
function applyFilters() {
    const roleFilter = document.getElementById('user-role').value;
    const statusFilter = document.getElementById('user-status').value;
    const searchFilter = document.getElementById('search-user').value.toLowerCase();

    const filtered = allUsers.filter(user => {
        // Role Match
        const roleMatch = !roleFilter || (user.role === roleFilter);

        // Status Match
        const statusMatch = !statusFilter || (user.status && user.status.toLowerCase() === statusFilter.toLowerCase());

        // Search Match (Name or Email)
        const name = (user.firstName + " " + user.lastName).toLowerCase();
        const searchMatch = !searchFilter || name.includes(searchFilter) || user.email.toLowerCase().includes(searchFilter);

        return roleMatch && statusMatch && searchMatch;
    });

    renderUsers(filtered);
}

function resetFilters() {
    document.getElementById('user-role').selectedIndex = 0;
    document.getElementById('user-status').selectedIndex = 0;
    document.getElementById('search-user').value = '';
    document.getElementById('registration-date').selectedIndex = 0;

    renderUsers(allUsers); // Show all again
}