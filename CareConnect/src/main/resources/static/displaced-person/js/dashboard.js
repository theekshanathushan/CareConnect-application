import { CONFIG, apiUtils } from '../../config.js';

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Authentication & Get User Info
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (!userId) {
        // Redirect to login if no user ID found
        window.location.href = "../login.html";
        return;
    }

    // Update Welcome Message
    if (userName) {
        const nameDisplay = document.getElementById('userNameDisplay');
        if(nameDisplay) nameDisplay.textContent = userName;
    }

    // 2. Load Dashboard Data
    loadDisplacedStats(userId);
    loadRecentActivity(userId);

    // 3. Setup Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear all session data
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
});

// Fetch Statistics (Active Requests, Helpers, Fulfilled)
async function loadDisplacedStats(userId) {
    try {
        // Endpoint: /api/dashboard/displaced-stats?userId={id}
        const url = `${CONFIG.API_BASE_URL}/dashboard/displaced-stats?userId=${userId}`;
        const stats = await apiUtils.get(url);

        // Update DOM elements
        const activeEl = document.getElementById('activeRequestsDisplay');
        if(activeEl) activeEl.textContent = stats.activeRequests || 0;

        const helpersEl = document.getElementById('helpersAssignedDisplay');
        if(helpersEl) helpersEl.textContent = stats.helpersAssigned || 0;

        const fulfilledEl = document.getElementById('requestsFulfilledDisplay');
        if(fulfilledEl) fulfilledEl.textContent = stats.requestsFulfilled || 0;

    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

// Fetch Recent Activity (The user's own help requests)
async function loadRecentActivity(userId) {
    const container = document.getElementById('recentRequestsList');
    if(!container) return;

    try {
        // Endpoint: /api/dashboard/displaced-activity?userId={id}
        const url = `${CONFIG.API_BASE_URL}/dashboard/displaced-activity?userId=${userId}`;
        const activity = await apiUtils.get(url);

        // Handle Empty State
        if (!activity || activity.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <p>No requests found. Click "Request Help" to submit one.</p>
                </div>`;
            return;
        }

        container.innerHTML = ''; // Clear loading text

        // Show last 3 items
        activity.slice(0, 3).forEach(req => {
            const date = new Date(req.createdAt).toLocaleDateString();

            // Determine status color
            let statusColor = '#f39c12'; // Pending (Orange)
            if(req.status === 'Fulfilled') statusColor = '#2ecc71'; // Green
            if(req.status === 'In Progress') statusColor = '#3498db'; // Blue
            if(req.status === 'Cancelled') statusColor = '#e74c3c'; // Red

            const element = document.createElement('div');
            element.className = 'activity-item';
            element.innerHTML = `
                <div class="activity-icon">📋</div>
                <div class="activity-details">
                    <h4>${req.requestType} Request</h4>
                    <p>${req.description || 'Request for assistance'}</p>
                    <div style="display:flex; justify-content:space-between; margin-top:5px; font-size:0.85rem;">
                        <span class="activity-time">${date}</span>
                        <span style="color:${statusColor}; font-weight:bold;">${req.status}</span>
                    </div>
                </div>
            `;
            container.appendChild(element);
        });

    } catch (error) {
        console.error("Error loading activity:", error);
        container.innerHTML = '<p style="color:red; text-align:center;">Failed to load activity. Please check backend connection.</p>';
    }
}