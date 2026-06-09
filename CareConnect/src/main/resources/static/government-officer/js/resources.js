import { CONFIG, apiUtils } from '../../config.js';

let allResources = [];

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Auth
    const role = localStorage.getItem('userRole');
    if (role !== 'government' && role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }

    // 2. Load Data
    loadResources();

    // 3. Setup Listeners
    setupModal();
    setupFilters();
});

// --- LOAD RESOURCES ---
async function loadResources() {
    const container = document.getElementById('resourceInventoryList');
    container.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading inventory...</p>';

    try {
        const url = `${CONFIG.API_BASE_URL}/resources/all`;
        allResources = await apiUtils.get(url);
        renderResources(allResources);
    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = '<p style="color: red; text-align: center;">Failed to load resources.</p>';
    }
}

// --- RENDER LIST ---
function renderResources(resources) {
    const container = document.getElementById('resourceInventoryList');
    container.innerHTML = '';

    if (resources.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem;">No resources found.</p>';
        return;
    }

    resources.forEach(res => {
        let statusClass = 'available';
        if (res.status === 'Critical' || res.status === 'Depleted') statusClass = 'critical';
        else if (res.status === 'Limited') statusClass = 'limited';

        let icon = '📦';
        const type = (res.type || '').toLowerCase();
        if (type.includes('food')) icon = '🍚';
        else if (type.includes('medical')) icon = '⚕️';
        else if (type.includes('shelter')) icon = '🏠';
        else if (type.includes('clothing')) icon = '👕';

        const div = document.createElement('div');
        div.className = 'resource-item';
        div.innerHTML = `
            <div class="resource-header">
                <div class="resource-icon">${icon}</div>
                <div class="resource-meta">
                    <h3>${res.title}</h3>
                    <span class="resource-status ${statusClass}">${res.status || 'Available'}</span>
                </div>
            </div>
            <p class="resource-description">${res.description || 'No description'}</p>
            <div class="resource-details">
                <div class="detail-item"><span class="detail-label">Type:</span><span>${res.type}</span></div>
                <div class="detail-item"><span class="detail-label">Quantity:</span><span>${res.quantity}</span></div>
                <div class="detail-item"><span class="detail-label">Warehouse:</span><span>${res.warehouse || 'Central'}</span></div>
            </div>
            <div class="resource-actions">
                <button class="btn primary small allocate-btn">Adjust Stock</button>
                <button class="btn edit small edit-btn">Edit</button>
                <button class="btn danger small delete-btn">Delete</button>
            </div>
        `;

        // Attach Event Listeners
        div.querySelector('.allocate-btn').addEventListener('click', () => allocateResource(res));
        div.querySelector('.edit-btn').addEventListener('click', () => openEditModal(res));
        div.querySelector('.delete-btn').addEventListener('click', () => deleteResource(res.id));

        container.appendChild(div);
    });
}

// --- OPEN EDIT MODAL ---
function openEditModal(resource) {
    document.getElementById('modalTitle').textContent = "Edit Resource";
    document.getElementById('resId').value = resource.id; // Set ID
    document.getElementById('resTitle').value = resource.title;
    document.getElementById('resType').value = resource.type;
    document.getElementById('resQuantity').value = resource.quantity;
    document.getElementById('resWarehouse').value = resource.warehouse;
    document.getElementById('resDesc').value = resource.description;

    document.getElementById('resourceModal').style.display = "block";
}

// --- SAVE RESOURCE (ADD OR UPDATE) ---
async function saveResource(e) {
    e.preventDefault();

    const id = document.getElementById('resId').value;
    const itemData = {
        title: document.getElementById('resTitle').value,
        type: document.getElementById('resType').value,
        quantity: parseInt(document.getElementById('resQuantity').value),
        warehouse: document.getElementById('resWarehouse').value,
        description: document.getElementById('resDesc').value,
        status: "Available"
    };

    try {
        if (id) {
            // UPDATE Existing
            await apiUtils.put(`${CONFIG.API_BASE_URL}/resources/update/${id}`, itemData);
            alert('Resource updated successfully!');
        } else {
            // CREATE New
            await apiUtils.post(`${CONFIG.API_BASE_URL}/resources/add`, itemData);
            alert('Resource added successfully!');
        }

        document.getElementById('resourceModal').style.display = "none";
        document.getElementById('resourceForm').reset();
        document.getElementById('resId').value = ""; // Clear ID
        loadResources();

    } catch (error) {
        alert('Failed to save resource: ' + error.message);
    }
}

// --- DELETE RESOURCE ---
async function deleteResource(id) {
    if (!confirm("Are you sure you want to delete this resource? This cannot be undone.")) {
        return;
    }

    try {
        await apiUtils.delete(`${CONFIG.API_BASE_URL}/resources/${id}`);
        loadResources();
    } catch (error) {
        alert("Failed to delete: " + error.message);
    }
}

// --- ALLOCATE / ADJUST STOCK (Prompt) ---
async function allocateResource(resource) {
    // We changed "Allocate" to "Adjust Stock" - can increase or decrease
    const input = prompt(`Update stock for ${resource.title}.\nCurrent Stock: ${resource.quantity}\n\nEnter NEW total quantity:`, resource.quantity);

    if (input === null) return; // Cancelled

    const newQuantity = parseInt(input);
    if (isNaN(newQuantity) || newQuantity < 0) {
        alert("Invalid quantity");
        return;
    }

    resource.quantity = newQuantity;

    try {
        await apiUtils.put(`${CONFIG.API_BASE_URL}/resources/update/${resource.id}`, resource);
        loadResources();
    } catch (error) {
        alert("Error updating stock: " + error.message);
    }
}

// --- SETUP MODAL & FILTERS ---
function setupModal() {
    const modal = document.getElementById('resourceModal');
    const btn = document.getElementById('addResourceBtn');
    const closeSpans = document.querySelectorAll('.close, .close-btn');
    const form = document.getElementById('resourceForm');

    // "Add New" Button resets the form first
    if(btn) btn.onclick = () => {
        document.getElementById('modalTitle').textContent = "Add New Resource";
        document.getElementById('resourceForm').reset();
        document.getElementById('resId').value = "";
        modal.style.display = "block";
    };

    closeSpans.forEach(span => {
        span.onclick = () => modal.style.display = "none";
    });

    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };

    if(form) form.addEventListener('submit', saveResource);
}

function setupFilters() {
    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');

    if(applyBtn) {
        applyBtn.addEventListener('click', () => {
            const typeFilter = document.getElementById('resource-type').value;
            const whFilter = document.getElementById('warehouse').value;

            const filtered = allResources.filter(res => {
                const matchType = !typeFilter || res.type === typeFilter;
                const matchWh = !whFilter || res.warehouse === whFilter;
                return matchType && matchWh;
            });
            renderResources(filtered);
        });
    }

    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('resource-type').value = "";
            document.getElementById('warehouse').value = "";
            renderResources(allResources);
        });
    }
}