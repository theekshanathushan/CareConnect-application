import { CONFIG, apiUtils } from '../../config.js';

let allCases = [];
let currentCaseId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadCases();

    // Filter Logic
    const applyBtn = document.getElementById('applyFilters');
    if(applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }

    const resetBtn = document.getElementById('resetFilters');
    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            const filterEl = document.getElementById('statusFilter');
            if(filterEl) filterEl.selectedIndex = 0;
            renderCases(allCases);
        });
    }

    // Modal Handling (Close on X or outside click)
    const modal = document.getElementById('caseModal');
    const closeBtn = document.querySelector('.close-modal');

    if(closeBtn) {
        closeBtn.onclick = () => modal.style.display = "none";
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Modal Action Buttons
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');

    if(approveBtn) approveBtn.addEventListener('click', () => updateCaseStatus(currentCaseId, 'Approved'));
    if(rejectBtn) rejectBtn.addEventListener('click', () => updateCaseStatus(currentCaseId, 'Rejected'));
});

// --- Fetch Cases ---
async function loadCases() {
    const container = document.getElementById('casesListContainer');
    if (!container) return;

    try {
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading cases...</p>';
        const url = `${CONFIG.API_BASE_URL}/requests/all`; // Matches Controller
        allCases = await apiUtils.get(url);
        renderCases(allCases);
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red; text-align:center;">Failed to load cases.</p>';
    }
}

// --- Render List ---
function renderCases(cases) {
    const container = document.getElementById('casesListContainer');
    container.innerHTML = '';

    if (!cases || cases.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No cases found.</p>';
        return;
    }

    // Sort by Newest First
    cases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    cases.forEach(c => {
        // List Status Colors
        let statusClass = 'pending';
        if(c.status === 'Approved') statusClass = 'resolved'; // Ensure CSS matches .resolved
        if(c.status === 'Rejected') statusClass = 'closed';
        if(c.status === 'In Progress') statusClass = 'in-progress';

        const div = document.createElement('div');
        div.className = 'case-item';
        div.innerHTML = `
            <div class="case-header">
                <div class="case-icon">📋</div>
                <div class="case-meta">
                    <h3>${c.requestType} Request</h3>
                    <span class="case-status ${statusClass}">${c.status}</span>
                </div>
            </div>
            <p class="case-description">${c.description ? c.description.substring(0, 80) + '...' : 'No description provided.'}</p>
            <div class="case-details">
                <div class="detail-item"><span class="detail-label">Name:</span><span class="detail-value">${c.contactName || 'Unknown'}</span></div>
                <div class="detail-item"><span class="detail-label">Town:</span><span class="detail-value">${c.town || c.location || 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Date:</span><span class="detail-value">${new Date(c.createdAt).toLocaleDateString()}</span></div>
            </div>
            <div class="case-actions">
                <button class="btn secondary small" onclick="openCaseModal(${c.id})">View & Manage</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// --- OPEN FLOATING WINDOW (MODAL) ---
// Attached to window so inline onclick works
window.openCaseModal = function(id) {
    const c = allCases.find(item => item.id === id);
    if (!c) return;

    currentCaseId = id;

    // 1. Populate Header & Core Info
    setText('modalTitle', `${c.requestType} Request`);
    setText('modalType', c.requestType);
    setText('modalUrgency', c.urgency);
    setText('modalQuantity', c.quantity ? c.quantity : 'Not specified');
    setText('modalTimeframe', c.timeframe || 'Not specified');
    setText('modalDate', new Date(c.createdAt).toLocaleString());

    // 2. Populate Applicant Details
    setText('modalName', c.contactName);
    setText('modalIdentity', c.identityNumber || 'Not Provided');
    setText('modalPhone', c.contactPhone);

    // 3. Populate Location Details
    setText('modalDistrict', c.district || 'Not Provided');
    setText('modalTown', c.town || 'Not Provided');
    setText('modalAddress', c.homeNumber || 'Not Provided');
    // If location field is empty, fallback to town/district combo or just town
    setText('modalCurrentLoc', c.location || `${c.town}, ${c.district}` || 'Same as Home Address');

    // 4. Description
    setText('modalDesc', c.description);

    // 5. Update Status Badge (Color & Text)
    const statusBadge = document.getElementById('modalStatus');
    if(statusBadge) {
        statusBadge.textContent = c.status || 'Pending';
        // Map status string to CSS class safely
        let badgeClass = 'status-pending';
        if (c.status === 'Approved') badgeClass = 'status-approved';
        if (c.status === 'Rejected') badgeClass = 'status-rejected';
        statusBadge.className = `status-badge-large ${badgeClass}`;
    }

    // 6. Handle Evidence Image
    const imgEl = document.getElementById('modalImage');
    const noImgText = document.getElementById('noImageText');
    const imgContainer = document.getElementById('modalImageContainer');

    if (c.evidenceImage) {
        if(imgEl) {
            imgEl.src = c.evidenceImage;
            imgEl.style.display = 'block';
        }
        if(noImgText) noImgText.style.display = 'none';
        if(imgContainer) imgContainer.style.display = 'flex';
    } else {
        if(imgEl) imgEl.style.display = 'none';
        if(noImgText) noImgText.style.display = 'block';
    }

    // 7. Show/Hide Action Buttons based on status
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');

    if (c.status === 'Pending') {
        if(approveBtn) approveBtn.style.display = 'inline-flex';
        if(rejectBtn) rejectBtn.style.display = 'inline-flex';
    } else {
        if(approveBtn) approveBtn.style.display = 'none';
        if(rejectBtn) rejectBtn.style.display = 'none';
    }

    // 8. Display the Modal
    document.getElementById('caseModal').style.display = "block";
};

// Helper function to set text content safely
function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

// --- Update Status API Call ---
async function updateCaseStatus(id, newStatus) {
    if (!id) return;
    if (!confirm(`Are you sure you want to mark this request as ${newStatus}?`)) return;

    try {
        // Matches Controller endpoint: @PutMapping("/{id}/status")
        const url = `${CONFIG.API_BASE_URL}/requests/${id}/status`;

        await apiUtils.put(url, { status: newStatus });

        alert(`Request has been ${newStatus}.`);
        document.getElementById('caseModal').style.display = "none";

        // Refresh the list to show new status
        loadCases();

    } catch (error) {
        console.error("Update failed:", error);
        alert("Failed to update status. " + (error.message || "Server error"));
    }
}

// --- Filter Logic ---
function applyFilters() {
    const statusEl = document.getElementById('statusFilter');
    const status = statusEl ? statusEl.value : '';

    const filtered = allCases.filter(c => {
        return !status || c.status === status;
    });

    renderCases(filtered);
}