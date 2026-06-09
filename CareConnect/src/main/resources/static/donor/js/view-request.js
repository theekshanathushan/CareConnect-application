import { CONFIG, apiUtils } from '../../config.js';

let allRequests = [];

document.addEventListener('DOMContentLoaded', function() {
    loadRequests();
    setupFilters();
    setupModal();
});

// --- 1. Fetch Data ---
async function loadRequests() {
    const container = document.getElementById('requestsGrid');

    try {
        container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Loading requests...</p>';

        // Fetch ALL requests from backend
        // Endpoint: /api/requests/all
        const url = `${CONFIG.API_BASE_URL}/requests/all`;
        const data = await apiUtils.get(url);

        // Filter: Only show "Approved" requests to Donors
        allRequests = data.filter(req => req.status === 'Approved');

        // Initial Render
        renderRequests(allRequests);

    } catch (error) {
        console.error("Error loading requests:", error);
        container.innerHTML = `<p style="color: red; grid-column: 1/-1; text-align: center;">Failed to load requests. Please check connection.</p>`;
    }
}

// --- 2. Render Grid ---
function renderRequests(requests) {
    const container = document.getElementById('requestsGrid');
    container.innerHTML = '';

    if (!requests || requests.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 2rem;">No matching requests found.</p>';
        return;
    }

    requests.forEach(req => {
        // Determine Icon
        let icon = '📦';
        const type = (req.requestType || '').toLowerCase();
        if (type.includes('food')) icon = '🍚';
        else if (type.includes('medical')) icon = '⚕️';
        else if (type.includes('shelter')) icon = '🏠';
        else if (type.includes('cloth')) icon = '👕';
        else if (type.includes('education')) icon = '🎓';

        // Urgency Style
        const urgency = req.urgency || 'Medium';
        let urgencyClass = 'urgency-medium';
        if (urgency.toLowerCase() === 'high' || urgency.toLowerCase() === 'emergency') urgencyClass = 'urgency-high';
        else if (urgency.toLowerCase() === 'low') urgencyClass = 'urgency-low';

        // Create Card
        const card = document.createElement('div');
        card.className = 'request-card';
        // Note: Inline styles are here to ensure layout if CSS is missing/delayed
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:1.8rem; background:#f0f2f5; width:50px; height:50px; display:flex; align-items:center; justify-content:center; border-radius:50%;">${icon}</span>
                    <div>
                        <h3 style="margin:0; font-size:1.1rem; color:#333;">${req.requestType}</h3>
                        <small style="color:#777;">${new Date(req.createdAt).toLocaleDateString()}</small>
                    </div>
                </div>
                <span class="status-badge ${urgencyClass}">${urgency}</span>
            </div>

            <p style="color:#555; font-size:0.95rem; line-height:1.5; margin-bottom:15px; flex-grow:1;">
                ${req.description ? req.description.substring(0, 100) + (req.description.length > 100 ? '...' : '') : 'No description provided.'}
            </p>

            <div style="border-top:1px solid #eee; padding-top:15px; margin-top:auto;">
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; color:#666; margin-bottom:15px;">
                    <span>📍 ${req.town || req.location || 'Unknown'}</span>
                    <span>Qty: <strong>${req.quantity || 1}</strong></span>
                </div>
                <button class="btn primary view-btn" style="width:100%;">View Details & Donate</button>
            </div>
        `;

        // Attach Event Listener manually (Avoiding inline onclick issues)
        card.querySelector('.view-btn').addEventListener('click', () => openModal(req));

        container.appendChild(card);
    });
}

// --- 3. Filter Logic ---
function setupFilters() {
    const applyBtn = document.getElementById('applyBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Apply Filters
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const cat = getValue('category');
            const loc = getValue('location');
            const urg = getValue('urgency');
            const dateFilter = getValue('date');

            const filtered = allRequests.filter(req => {
                // Category Match
                const matchCat = !cat || (req.requestType || '').toLowerCase().includes(cat);

                // Location Match (Check town or district)
                const reqLoc = (req.location + " " + req.town + " " + req.district).toLowerCase();
                const matchLoc = !loc || reqLoc.includes(loc);

                // Urgency Match
                const matchUrg = !urg || (req.urgency || '').toLowerCase() === urg;

                // Date Match
                let matchDate = true;
                if (dateFilter) {
                    const reqDate = new Date(req.createdAt);
                    const now = new Date();
                    const diffTime = Math.abs(now - reqDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (dateFilter === 'today') matchDate = diffDays <= 1;
                    else if (dateFilter === 'week') matchDate = diffDays <= 7;
                    else if (dateFilter === 'month') matchDate = diffDays <= 30;
                }

                return matchCat && matchLoc && matchUrg && matchDate;
            });

            renderRequests(filtered);
        });
    }

    // Reset Filters
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('category').selectedIndex = 0;
            document.getElementById('location').selectedIndex = 0;
            document.getElementById('urgency').selectedIndex = 0;
            document.getElementById('date').selectedIndex = 0;
            renderRequests(allRequests);
        });
    }
}

// --- 4. Modal Logic ---
function openModal(req) {
    const modal = document.getElementById('requestModal');
    if(!modal) return;

    // Populate Modal Fields
    setText('modalTitle', `${req.requestType} Request`);
    setText('modalCategory', req.requestType);
    setText('modalUrgency', req.urgency);
    setText('modalLocation', req.location || `${req.town}, ${req.district}`);
    setText('modalQty', req.quantity);
    setText('modalDesc', req.description);

    // Handle Evidence Image
    const imgContainer = document.getElementById('imgContainer');
    const img = document.getElementById('modalImg');
    if (req.evidenceImage && img) {
        img.src = req.evidenceImage;
        imgContainer.style.display = 'block';
    } else if (imgContainer) {
        imgContainer.style.display = 'none';
    }

    // "Donate Now" Button -> Redirects to Donate Page with Cause and Ref ID
    const donateBtn = document.getElementById('modalDonateBtn');
    if(donateBtn) {
        donateBtn.onclick = () => {
            window.location.href = `donate.html?cause=${encodeURIComponent(req.requestType)}&ref=${req.id}`;
        };
    }

    modal.style.display = 'block';
}

function setupModal() {
    const modal = document.getElementById('requestModal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';

    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = 'none';
    };
}

// Helper Functions
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.toLowerCase() : '';
}

function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}