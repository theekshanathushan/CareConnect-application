import { CONFIG, apiUtils } from '../../config.js';

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Authentication
    const userId = localStorage.getItem('userId');
    if (!userId) {
        // If not logged in, redirect to login page
        window.location.href = "../login.html";
        return;
    }

    // 2. Load Notifications from Backend
    loadNotifications(userId);

    // 3. Initialize Settings UI (Your existing logic)
    setupSettingsUI();
});

// --- Backend Connection Logic ---

async function loadNotifications(userId) {
    const container = document.getElementById('notificationsList');

    if (!container) return;

    try {
        // Generate a welcome notification if this is a fresh run (Optional helper)
        // This helps populate the list if it's empty
        await fetch(`${CONFIG.API_BASE_URL}/notifications/generate/${userId}`, { method: 'POST' });

        // Fetch all notifications
        // Endpoint: /api/notifications/{userId}
        const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.NOTIFICATIONS.GET_ALL(userId)}`;
        const notifications = await apiUtils.get(url);

        // Handle empty state
        if (!notifications || notifications.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <p>You have no new notifications.</p>
                </div>`;
            return;
        }

        // Clear loading message
        container.innerHTML = '';

        // Render each notification
        notifications.forEach(notif => {
            const date = new Date(notif.date).toLocaleDateString() + ' ' + new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            const element = document.createElement('div');
            // Add 'unread' class if the notification hasn't been read
            element.className = `notification-item ${notif.isRead ? '' : 'unread'}`;

            element.innerHTML = `
                <div class="notification-icon">🔔</div>
                <div class="notification-content">
                    <h3>${notif.title || 'Notification'}</h3>
                    <p class="notification-message">${notif.message}</p>
                    <div class="notification-meta">
                        <span class="notification-time">${date}</span>
                        <span class="notification-category ${notif.type || 'update'}">${(notif.type || 'Update').toUpperCase()}</span>
                    </div>
                </div>
                <div class="notification-actions">
                    <button class="btn secondary small dismiss-btn">Dismiss</button>
                </div>
            `;

            // Add click event to the dismiss button
            const dismissBtn = element.querySelector('.dismiss-btn');
            dismissBtn.addEventListener('click', function() {
                element.style.opacity = '0';
                setTimeout(() => element.remove(), 300);
            });

            container.appendChild(element);
        });

    } catch (error) {
        console.error('Error loading notifications:', error);
        container.innerHTML = '<p style="color:red; text-align:center; padding: 1rem;">Failed to load notifications. Is the backend running?</p>';
    }
}

// --- UI Logic (Settings & Toggles) ---

function setupSettingsUI() {
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');

    toggleSwitches.forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            console.log(`${this.id} toggled: ${this.checked}`);
        });
    });

    const settingButtons = document.querySelectorAll('.setting-buttons .btn');

    settingButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('primary')) {
                alert('Settings saved successfully!');
            } else {
                // Reset to defaults
                document.getElementById('email-notifications').checked = true;
                document.getElementById('sms-notifications').checked = false;
                document.getElementById('push-notifications').checked = true;
                document.getElementById('request-updates').checked = true;
                document.getElementById('donation-confirmations').checked = true;
                document.getElementById('community-news').checked = true;
                alert('Settings reset to defaults.');
            }
        });
    });
}