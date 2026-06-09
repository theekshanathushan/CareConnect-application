import { CONFIG, apiUtils } from '../../config.js';

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Authentication & Role
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    if (!userId) {
        window.location.href = "../login.html";
        return;
    }

    if (role !== 'admin') {
        alert("Access Denied: You do not have administrator privileges.");
        window.location.href = "../index.html";
        return;
    }

    // Update Admin Name
    if (userName) {
        const nameDisplay = document.getElementById('adminNameDisplay');
        if(nameDisplay) nameDisplay.textContent = userName;
    }

    // 2. Initialize Dashboard (Load immediately)
    loadAdminStats();
    loadSystemActivity();

    // --- NEW: Real-Time Updates (Poll every 5 seconds) ---
    setInterval(() => {
        loadAdminStats();
        loadSystemActivity();
    }, 5000);
    // -----------------------------------------------------

    // 3. Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
});

async function loadAdminStats() {
    try {
        // Endpoint: /api/admin/stats
        // Returns: { totalUsers: "5", totalDonations: "12", activeIncidents: "3", uptime: "99.9%" }
        const url = `${CONFIG.API_BASE_URL}/admin/stats`;
        const stats = await apiUtils.get(url);

        // Update Numbers with Animation
        // Note: Ensure your HTML IDs match these strings (totalUsersDisplay, etc.)
        if (stats.totalUsers) animateValue("totalUsersDisplay", 0, parseInt(stats.totalUsers), 1000);
        if (stats.activeIncidents) animateValue("activeCasesDisplay", 0, parseInt(stats.activeIncidents), 1000);

        // Mapping "totalDonations" from backend to "resourcesDisplay" or "donationsDisplay" in HTML
        // Check your HTML to see which ID you are using for the third card.
        // If it is 'resourcesDisplay', use this:
        if (stats.totalDonations) animateValue("resourcesDisplay", 0, parseInt(stats.totalDonations), 1000);

        const uptimeEl = document.getElementById('uptimeDisplay');
        if(uptimeEl) uptimeEl.textContent = stats.uptime || "100%";

    } catch (error) {
        console.error("Error loading admin stats:", error);
    }
}

async function loadSystemActivity() {
    const container = document.getElementById('adminActivityList');
    if (!container) return;

    try {
        // Endpoint: /api/admin/activities
        // Fetches list of ActivityLog objects
        const url = `${CONFIG.API_BASE_URL}/admin/activities`;
        const activities = await apiUtils.get(url);

        // Take only the top 5 recent activities
        const recentActivities = activities.slice(0, 5);

        if (!recentActivities || recentActivities.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No recent system activity.</p>';
            return;
        }

        // Clear container to rebuild list
        container.innerHTML = '';

        recentActivities.forEach(act => {
            const date = new Date(act.timestamp).toLocaleString();

            // Icon Logic
            let icon = '📋';
            const actionLower = (act.action || '').toLowerCase();
            if(actionLower.includes('login')) icon = '👤';
            if(actionLower.includes('suspend')) icon = '🚫';
            if(actionLower.includes('activate')) icon = '✅';

            const div = document.createElement('div');
            div.className = 'activity-item';
            div.innerHTML = `
                <div class="activity-icon">${icon}</div>
                <div class="activity-details">
                    <h4>${act.action}</h4>
                    <p>${act.description || ''} <span style="font-size:0.9em; color:#888;">by ${act.user}</span></p>
                    <span class="activity-time">${date}</span>
                </div>
            `;
            container.appendChild(div);
        });

    } catch (error) {
        console.error("Error loading activity:", error);
        // Don't overwrite with error message on every poll if it fails once, just log it.
    }
}

// Animation Helper Function
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    // If content is already the target number, don't re-animate (prevents flickering)
    if (obj.textContent == end) return;

    // Handle case where end is 0 or invalid
    if (!end && end !== 0) {
        obj.textContent = "0";
        return;
    }

    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / range));

    // Ensure stepTime isn't too small
    stepTime = Math.max(stepTime, 10);

    // If the jump is too small (e.g. updating from 5 to 6), just update immediately
    if (range === 0 || duration === 0) {
        obj.textContent = end;
        return;
    }

    let timer = setInterval(function() {
        current += increment;
        obj.textContent = current;
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);

    // Safety clear in case logic misses exact end
    setTimeout(() => {
        clearInterval(timer);
        obj.textContent = end;
    }, duration + 100);
}