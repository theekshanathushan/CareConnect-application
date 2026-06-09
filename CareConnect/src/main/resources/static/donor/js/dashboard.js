import { CONFIG } from '../../config.js';

let stompClient = null;

document.addEventListener('DOMContentLoaded', function() {
    // 1. Load User Info from LocalStorage
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        // Redirect if not logged in
        window.location.href = '../login.html';
        return;
    }

    // Update the Welcome Message
    if (userName) {
        const nameDisplay = document.getElementById('userNameDisplay');
        if(nameDisplay) nameDisplay.textContent = userName;
    }

    // 2. Initialize Dashboard Data
    fetchDonorStats(userId);
    fetchRecentActivity(userId);

    // 3. Connect to WebSocket for Real-Time Updates
    connectWebSocket(userId);

    // 4. Setup Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); // Clears all session data
            window.location.href = '../index.html';
        });
    }
});

// --- WEBSOCKET CONNECTION ---
function connectWebSocket(userId) {
    // Connect to the WebSocket endpoint defined in Spring Boot
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);

    // Disable debug logs for cleaner console output
    stompClient.debug = null;

    stompClient.connect({}, function (frame) {
        console.log('Connected to Real-time Updates: ' + frame);

        // Subscribe to this specific donor's updates
        stompClient.subscribe('/topic/dashboard/' + userId, function (message) {
            if (message.body === "REFRESH") {
                console.log("Real-time update received! Refreshing dashboard...");
                // Reload data without refreshing the page
                fetchDonorStats(userId);
                fetchRecentActivity(userId);
            }
        });
    });
}

// --- FETCH STATISTICS ---
async function fetchDonorStats(userId) {
    try {
        let url = `${CONFIG.API_BASE_URL}/dashboard/donor-stats?userId=${userId}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch stats");

        const data = await response.json();

        // Update DOM elements
        const donationsEl = document.getElementById('totalDonationsDisplay');
        if (donationsEl) donationsEl.textContent = data.totalDonated || 0; // Updated key to match likely backend DTO

        const peopleEl = document.getElementById('peopleHelpedDisplay');
        if (peopleEl) peopleEl.textContent = data.peopleHelped || 0;

        const requestsEl = document.getElementById('activeRequestsDisplay');
        if (requestsEl) requestsEl.textContent = data.activeDonations || 0; // Updated key

    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

// --- FETCH RECENT ACTIVITY ---
async function fetchRecentActivity(userId) {
    try {
        let url = `${CONFIG.API_BASE_URL}/dashboard/recent-activity?userId=${userId}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch activity");

        const activities = await response.json();
        const container = document.getElementById('recentActivityList');

        if (!container) return;

        // Handle empty state
        if (activities.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding: 20px; color:#666;">No recent activity found. Make your first donation!</div>';
            return;
        }

        // Clear previous content
        container.innerHTML = '';

        // Render each activity item
        activities.forEach(activity => {
            const dateObj = new Date(activity.donationDate || activity.date);
            const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            const html = `
                <div class="activity-item">
                    <div class="activity-icon">💰</div>
                    <div class="activity-details">
                        <h4>${activity.cause || 'General Donation'}</h4>
                        <p>Donated <strong>LKR ${activity.amount}</strong> - ${activity.donationType || 'Monetary Support'}</p>
                        <span class="activity-time">${dateStr}</span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

    } catch (error) {
        console.error("Error loading activity:", error);
        const container = document.getElementById('recentActivityList');
        if (container) container.innerHTML = '<p style="text-align:center; color:red;">Unable to load activity.</p>';
    }
}