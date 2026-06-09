import { CONFIG, apiUtils } from '../../config.js';

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Authentication
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("Please log in to view your history.");
        window.location.href = "../login.html";
        return;
    }

    // 2. Load Data (Stats + List)
    loadHistoryStats(userId);
    loadHistoryList(userId);

    // 3. Handle Filter Buttons
    const filterButtons = document.querySelectorAll('.filter-buttons .btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('primary')) {
                // In a real app, you would pass these filter values to the API
                const type = document.getElementById('history-type').value;
                const date = document.getElementById('history-date').value;
                alert(`Filter feature coming soon! (Selected: ${type}, ${date})`);
            } else {
                // Reset filters
                document.getElementById('history-type').selectedIndex = 0;
                document.getElementById('history-date').selectedIndex = 0;
                // Reload original data
                loadHistoryList(userId);
            }
        });
    });
});

// --- Fetch Stats for Top Summary Cards ---
async function loadHistoryStats(userId) {
    try {
        const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.DASHBOARD.DONOR_STATS}?userId=${userId}`;
        const stats = await apiUtils.get(url);

        // Update HTML Numbers using IDs from history.html
        const donationsEl = document.getElementById('totalDonationsDisplay');
        if (donationsEl) donationsEl.textContent = stats.totalDonations || 0;

        const peopleEl = document.getElementById('peopleHelpedDisplay');
        if (peopleEl) peopleEl.textContent = stats.peopleHelped || 0;

        // For "Requests Fulfilled", we use total donations as a proxy for now
        const fulfilledEl = document.getElementById('requestsFulfilledDisplay');
        if (fulfilledEl) fulfilledEl.textContent = stats.totalDonations || 0;

    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

// --- Fetch List for Bottom History Section ---
async function loadHistoryList(userId) {
    const container = document.getElementById('historyList');

    // Ensure container exists before trying to update it
    if (!container) return;

    try {
        // Show loading state
        container.innerHTML = '<p style="text-align:center; color: #666;">Loading your history...</p>';

        // Reuse the recent-activity endpoint as it returns the list of donations for the user
        // Endpoint: /api/dashboard/recent-activity?userId=123
        const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.DASHBOARD.RECENT_ACTIVITY}?userId=${userId}`;

        const history = await apiUtils.get(url);

        if (!history || history.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 2rem;">
                    <p>No donation history found.</p>
                    <a href="donate.html" class="btn primary small" style="margin-top:10px;">Make your first donation</a>
                </div>`;
            return;
        }

        // Clear loading message
        container.innerHTML = '';

        // Sort by date descending (newest first)
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render Items
        history.forEach(item => {
            const dateObj = new Date(item.date);
            const dateStr = dateObj.toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            // Choose icon based on type (simple logic)
            let icon = '💰';
            const type = (item.donationType || '').toLowerCase();
            if (type.includes('food')) icon = '🍚';
            else if (type.includes('medical')) icon = '🏥';
            else if (type.includes('shelter')) icon = '🏠';

            const element = document.createElement('div');
            element.className = 'history-item';
            element.innerHTML = `
                <div class="history-icon">${icon}</div>
                <div class="history-details">
                    <h3>${item.cause || 'General Support'}</h3>
                    <p class="history-description">${item.description || 'Contribution to relief efforts'}</p>
                    <div class="history-meta">
                        <span class="meta-item"><strong>Amount:</strong> $${item.amount}</span>
                        <span class="meta-item"><strong>Date:</strong> ${dateStr} at ${timeStr}</span>
                        <span class="meta-item"><strong>Type:</strong> ${item.donationType}</span>
                        <span class="meta-item"><strong>Status:</strong> <span class="status-completed" style="color: green;">Completed</span></span>
                    </div>
                </div>
            `;
            container.appendChild(element);
        });

    } catch (error) {
        console.error('Error loading history:', error);
        container.innerHTML = '<p style="color:red; text-align:center;">Failed to load history. Please try again later.</p>';
    }
}