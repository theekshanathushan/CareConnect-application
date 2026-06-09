import { CONFIG, apiUtils } from '../../config.js';

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Authentication
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = "../login.html";
        return;
    }

    // 2. Load Requests
    loadUserRequests(userId);

    // 3. Setup Modal Logic
    setupModal();

    // 4. Handle Filter Buttons (UI Logic)
    setupFilterButtons(userId);
});

// --- LOAD DATA ---
async function loadUserRequests(userId) {
    const container = document.getElementById('requestsList');
    if (!container) return;

    try {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Loading your requests...</p>';

        // Endpoint: /api/requests/user/{userId}
        const url = `${CONFIG.API_BASE_URL}/requests/user/${userId}`;
        const requests = await apiUtils.get(url);

        if (!requests || requests.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <p>You haven't submitted any requests yet.</p>
                    <a href="request-help.html" class="btn primary small" style="margin-top: 1rem;">Submit New Request</a>
                </div>`;
            return;
        }

        container.innerHTML = '';

        requests.forEach(req => {
            const date = new Date(req.createdAt).toLocaleDateString();

            // Icon Selection
            let icon = '📋';
            const type = (req.requestType || '').toLowerCase();
            if (type.includes('food')) icon = '🍚';
            else if (type.includes('shelter')) icon = '🏠';
            else if (type.includes('medical')) icon = '⚕️';
            else if (type.includes('clothing')) icon = '👕';

            // Status Styling
            const status = req.status || 'Pending';
            let statusClass = 'status-pending'; // Default CSS class
            if (status === 'Approved') statusClass = 'status-approved';
            else if (status === 'Rejected' || status === 'Cancelled') statusClass = 'status-rejected';

            const card = document.createElement('div');
            card.className = 'request-item'; // Matches CSS

            // Inline CSS to ensure card look
            card.style.cssText = "background: white; border-radius: 10px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border-left: 5px solid #007bff;";
            if (status === 'Approved') card.style.borderLeftColor = '#28a745';
            if (status === 'Rejected') card.style.borderLeftColor = '#dc3545';

            card.innerHTML = `
                <div class="request-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.5rem;">${icon}</span>
                        <h3 style="margin:0; font-size:1.1rem; color:#333;">${req.requestType}</h3>
                    </div>
                    <span class="status-badge ${statusClass}" style="padding:4px 10px; border-radius:12px; font-size:0.8rem; font-weight:bold; text-transform:uppercase;">${status}</span>
                </div>
                
                <p style="color:#666; font-size:0.95rem; margin-bottom:15px;">${req.description || 'No description provided.'}</p>
                
                <div class="request-details" style="display:flex; gap:20px; font-size:0.9rem; color:#555; margin-bottom:15px;">
                    <span><strong>Date:</strong> ${date}</span>
                    <span><strong>Qty:</strong> ${req.quantity}</span>
                    <span><strong>Urgency:</strong> ${req.urgency}</span>
                </div>

                <div class="request-actions" style="display:flex; justify-content:flex-end; gap:10px;">
                    <button class="btn secondary small view-btn">View Details</button>
                    ${status === 'Pending' ? `<button class="btn danger small cancel-btn">Cancel</button>` : ''}
                </div>
            `;

            // Bind Events
            card.querySelector('.view-btn').addEventListener('click', () => openModal(req));

            const cancelBtn = card.querySelector('.cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => cancelRequest(req.id));
            }

            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading requests:', error);
        container.innerHTML = '<p style="color:red; text-align:center;">Failed to load requests.</p>';
    }
}

// --- MODAL LOGIC ---
function openModal(request) {
    const modal = document.getElementById('detailsModal');
    if (!modal) return;

    document.getElementById('modalType').textContent = request.requestType;
    document.getElementById('modalDate').textContent = new Date(request.createdAt).toLocaleDateString();
    document.getElementById('modalDesc').textContent = request.description || "No description.";

    // Image Handling
    const imageContainer = document.getElementById('modalImageContainer'); // Ensure you add this div to your HTML modal
    if (imageContainer) {
        imageContainer.innerHTML = ''; // Clear previous
        if (request.evidenceImage) {
            const img = document.createElement('img');
            img.src = request.evidenceImage;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.marginTop = '10px';
            imageContainer.appendChild(img);
        } else {
            imageContainer.innerHTML = '<p style="color:#999; font-style:italic;">No image uploaded.</p>';
        }
    }

    // Status Badge
    const statusEl = document.getElementById('modalStatus');
    if (statusEl) {
        statusEl.textContent = request.status;
        statusEl.className = 'status-badge'; // reset
        if (request.status === 'Approved') statusEl.classList.add('status-approved');
        else if (request.status === 'Rejected' || request.status === 'Cancelled') statusEl.classList.add('status-rejected');
        else statusEl.classList.add('status-pending');
    }

    modal.style.display = "block";
}

// --- CANCEL REQUEST (Soft Delete) ---
async function cancelRequest(requestId) {
    if (!confirm('Are you sure you want to cancel this request? This action cannot be undone.')) return;

    try {
        // We use PUT to update status to "Cancelled" instead of DELETE, to keep history.
        const url = `${CONFIG.API_BASE_URL}/requests/${requestId}/status`;

        await apiUtils.put(url, { status: "Cancelled" });

        alert('Request cancelled successfully.');

        // Reload list
        const userId = localStorage.getItem('userId');
        loadUserRequests(userId);

    } catch (error) {
        console.error('Error cancelling request:', error);
        alert('Failed to cancel request.');
    }
}

// --- SETUP HELPERS ---
function setupModal() {
    const modal = document.getElementById('detailsModal');
    if (!modal) return;
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };
}

function setupFilterButtons(userId) {
    const btns = document.querySelectorAll('.filter-buttons .btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            loadUserRequests(userId); // Simple refresh for now
        });
    });
}