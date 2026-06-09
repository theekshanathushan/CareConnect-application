import { CONFIG, apiUtils } from '../../config.js';

document.addEventListener('DOMContentLoaded', function() {
    // 1. FIX: Case-insensitive role check
    const role = localStorage.getItem('userRole');
    if (!role || role.toUpperCase() !== 'ADMIN') {
        // Redirect if not logged in or not an admin
        window.location.href = '../login.html';
        return;
    }

    // 2. Initial Load
    fetchActivityLogs();

    // 3. Setup Buttons
    const applyBtn = document.getElementById('applyFiltersBtn');
    const resetBtn = document.getElementById('resetFiltersBtn');

    if (applyBtn) {
        applyBtn.addEventListener('click', fetchActivityLogs);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const roleInput = document.getElementById('roleFilter');
            const dateInput = document.getElementById('dateFilter');
            if(roleInput) roleInput.value = "";
            if(dateInput) dateInput.value = "";
            fetchActivityLogs();
        });
    }

    // 4. Auto Refresh (Every 10 seconds is better than 5)
    setInterval(fetchActivityLogs, 10000);
});

async function fetchActivityLogs() {
    const tableBody = document.getElementById('activityLogBody');
    if (!tableBody) return;

    try {
        const roleInput = document.getElementById('roleFilter');
        const dateInput = document.getElementById('dateFilter');

        const role = roleInput ? roleInput.value : '';
        const date = dateInput ? dateInput.value : '';

        // FIX: Ensure URL matches ActivityLogController @RequestMapping("/api/admin/activities")
        // Assuming CONFIG.API_BASE_URL is "http://localhost:8080/api"
        let url = `${CONFIG.API_BASE_URL}/admin/activities`;

        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (date) params.append('date', date);

        if ([...params].length > 0) url += `?${params.toString()}`;

        const logs = await apiUtils.get(url);
        renderTable(logs);

    } catch (error) {
        console.error("Error fetching logs:", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error loading logs: ${error.message}</td></tr>`;
    }
}

function renderTable(logs) {
    const tableBody = document.getElementById('activityLogBody');

    if (!logs || logs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No activity logs found.</td></tr>';
        return;
    }

    tableBody.innerHTML = '';

    logs.forEach(log => {
        const dateStr = new Date(log.timestamp).toLocaleString();

        let badgeClass = 'badge-default';
        const r = (log.role || '').toUpperCase();
        if (r === 'ADMIN') badgeClass = 'badge-admin';
        else if (r === 'GOVERNMENT') badgeClass = 'badge-gov';
        else if (r === 'DONOR') badgeClass = 'badge-donor';
        else if (r === 'DISPLACED') badgeClass = 'badge-user';

        const row = `
            <tr>
                <td>${dateStr}</td>
                <td style="font-weight: 500;">${log.user || 'Unknown'}</td>
                <td><span class="badge ${badgeClass}">${log.role || 'User'}</span></td>
                <td><strong>${log.action}</strong></td>
                <td style="color: #666;">${log.description || '-'}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}