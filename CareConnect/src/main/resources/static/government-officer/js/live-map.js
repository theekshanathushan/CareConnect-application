import { CONFIG, apiUtils } from '../../config.js';

let map;
let markers = [];

document.addEventListener('DOMContentLoaded', function() {
    // 1. SECURITY: Check Authentication & Role
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');

    if (!userId) {
        window.location.href = '../login.html';
        return;
    }

    if (!role || role.toLowerCase() !== 'government') {
        alert("Access Denied: Government access only.");
        window.location.href = '../index.html';
        return;
    }

    // 2. Initialize Map
    initMap();
    fetchMapData();

    // 3. Auto Refresh Loop (Every 5 seconds for "Real-Time" feel)
    setInterval(fetchMapData, 5000);

    // 4. Logout Handler (Essential for standalone page)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); // Clear session
            window.location.href = '../index.html';
        });
    }
});

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Center on Sri Lanka (Default)
    map = L.map('map').setView([7.8731, 80.7718], 8);

    // Dark Map Tiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

async function fetchMapData() {
    if (!map) return;

    try {
        const data = await apiUtils.get(`${CONFIG.API_BASE_URL}/map/data`);
        updateMarkers(data);
    } catch (error) {
        console.error("Map data error:", error);
    }
}

function updateMarkers(data) {
    // Clear existing markers to prevent duplicates
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    if (!data || data.length === 0) return;

    data.forEach(point => {
        // Style Logic: Red for Request, Green for Donor
        const isRequest = point.type === 'request';
        const typeClass = isRequest ? 'pin-red' : 'pin-green';
        const titleColor = isRequest ? '#ef4444' : '#10b981'; // Red / Green
        const typeLabel = isRequest ? 'Help Request' : 'Active Donor';

        // Animated Pulsing Icon
        const pulsingIcon = L.divIcon({
            className: 'pulse-marker', // Defined in CSS
            html: `<div class="${typeClass}"><div class="pin-ring"></div><div class="pin-dot"></div></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10], // Center the icon
            popupAnchor: [0, -10]
        });

        const marker = L.marker([point.lat, point.lng], { icon: pulsingIcon }).addTo(map);

        // Dark Theme Popup Content
        const popupHTML = `
            <div style="font-family: 'Segoe UI', sans-serif; min-width: 200px;">
                <h4 style="color:${titleColor}; margin:0 0 5px 0; text-transform:uppercase; font-size:0.75rem; font-weight:700; letter-spacing:0.5px;">${typeLabel}</h4>
                <strong style="font-size:1rem; color:#fff; display:block; margin-bottom:4px;">${point.title}</strong>
                <p style="margin:0 0 8px 0; color:#cbd5e1; font-size:0.9rem; line-height:1.4;">${point.description || 'No additional details.'}</p>
                ${point.urgency ? `<span style="background:${titleColor}; color:white; padding:3px 8px; border-radius:12px; font-size:0.75rem; font-weight:600;">${point.urgency} Priority</span>` : ''}
            </div>
        `;

        marker.bindPopup(popupHTML, {
            className: 'custom-popup', // Defined in CSS
            closeButton: false
        });

        markers.push(marker);
    });
}