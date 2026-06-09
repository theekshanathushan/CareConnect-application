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

    if (!role || role.toLowerCase() !== 'government') {
        alert("Access Denied: Government access only.");
        window.location.href = "../index.html";
        return;
    }

    // Update Welcome Message
    if (userName) {
        const nameDisplay = document.getElementById('officerNameDisplay');
        if(nameDisplay) nameDisplay.textContent = userName;
    }

    // 2. Initialize Dashboard Data
    loadGovernmentStats();
    loadGovernmentActivity();
    loadPendingDonations();

    // 3. Setup Auto-Refresh
    setInterval(loadPendingDonations, 5000);

    // 4. Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
});

// ==========================================
// --- DASHBOARD STATISTICS & ACTIVITY ---
// ==========================================

async function loadGovernmentStats() {
    try {
        // [FIX 1] Correct URL to match DashboardController.java
        const url = `${CONFIG.API_BASE_URL}/dashboard/government-stats`;
        const stats = await apiUtils.get(url);

        if(stats) {
            animateValue("activeCasesDisplay", 0, stats.activeCases || 0, 1000);
            animateValue("peopleServedDisplay", 0, stats.peopleServed || 0, 1000);
            animateValue("casesResolvedDisplay", 0, stats.resolvedCases || 0, 1000);
        }
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

async function loadGovernmentActivity() {
    const container = document.getElementById('govActivityList');
    if (!container) return;

    try {
        // [FIX 2] Correct URL to match DashboardController.java
        const url = `${CONFIG.API_BASE_URL}/dashboard/government-activity`;
        const activities = await apiUtils.get(url);

        if (!activities || activities.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding: 2rem; color:#666;">No recent activity found.</div>';
            return;
        }

        container.innerHTML = '';

        activities.forEach(req => {
            const date = new Date(req.createdAt).toLocaleDateString();
            const time = new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            let icon = '📋';
            const type = (req.requestType || '').toLowerCase();
            if (type.includes('food')) icon = '🍚';
            else if (type.includes('shelter')) icon = '🏠';
            else if (type.includes('medical')) icon = '⚕️';

            const div = document.createElement('div');
            div.className = 'activity-item';
            div.style.cssText = 'display:flex; gap:15px; padding:15px; border-bottom:1px solid #eee; align-items:center;';
            div.innerHTML = `
                <div style="font-size:1.5rem;">${icon}</div>
                <div>
                    <h4 style="margin:0; font-size:1rem;">New ${req.requestType} Request</h4>
                    <p style="margin:5px 0; color:#555; font-size:0.9rem;">
                        Location: ${req.location || req.town || 'Unknown'} <br>
                        <span style="font-size:0.8rem; color:#888;">${date} at ${time}</span>
                    </p>
                </div>
            `;
            container.appendChild(div);
        });

    } catch (error) {
        console.error("Error loading activity:", error);
        container.innerHTML = '<p style="color:red; text-align:center;">Failed to load activity stream.</p>';
    }
}

// ==========================================
// --- DONATION MANAGEMENT ---
// ==========================================

async function loadPendingDonations() {
    const tableBody = document.getElementById('donationTableBody');
    if (!tableBody) return;

    try {
        const url = `${CONFIG.API_BASE_URL}/donations?status=PENDING`;
        const donations = await apiUtils.get(url);

        if(!donations || donations.length === 0) {
            // Only overwrite if it currently shows "Loading..."
            if(tableBody.innerHTML.includes('Loading')) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#888;">No pending donations found.</td></tr>';
            }
            return;
        }

        tableBody.innerHTML = '';

        donations.forEach(donation => {
            const dateStr = new Date(donation.donationDate || Date.now()).toLocaleDateString();
            const row = `
                <tr style="border-bottom: 1px solid #eee;">
                    <td><strong>${donation.donorName}</strong></td>
                    <td>${donation.amount} (${donation.donationType})</td>
                    <td>${dateStr}</td>
                    <td><span class="status-badge">PENDING</span></td>
                    <td>
                        <button class="btn-action btn-approve" onclick="processDonation(${donation.id}, 'APPROVED')">✓ Approve</button>
                        <button class="btn-action btn-reject" onclick="processDonation(${donation.id}, 'REJECTED')">✕ Reject</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error('Error fetching donations:', error);
    }
}

window.processDonation = async function(id, status) {
    if(!confirm(`Are you sure you want to mark this donation as ${status}?`)) return;

    try {
        const url = `${CONFIG.API_BASE_URL}/donations/${id}/status`;
        const token = localStorage.getItem('authToken');

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: status })
        });

        if (response.ok) {
            alert(`Donation successfully ${status}`);
            loadPendingDonations();
        } else {
            alert("Failed to update status.");
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert("Network error occurred.");
    }
};

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    if (!end || end === 0) { obj.textContent = "0"; return; }

    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, 10);

    let timer = setInterval(function() {
        current += increment;
        obj.textContent = current;
        if (current == end) clearInterval(timer);
    }, stepTime);
}