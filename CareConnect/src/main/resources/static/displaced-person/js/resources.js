import { CONFIG, apiUtils } from '../../config.js';

let allResources = [];

document.addEventListener('DOMContentLoaded', function() {
    loadResources();
    setupCategoryFilters();
    setupModal(); // Initialize modal logic
});

// --- FETCH DATA ---
async function loadResources() {
    const container = document.getElementById('resourcesGrid');
    if (!container) return;

    try {
        container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Loading resources...</p>';

        const url = `${CONFIG.API_BASE_URL}/resources/all`;
        const data = await apiUtils.get(url);

        allResources = data || [];
        renderResources(allResources);

    } catch (error) {
        console.error('Error loading resources:', error);
        container.innerHTML = '<p style="color: red; text-align: center; grid-column: 1/-1;">Failed to load resources.</p>';
    }
}

// --- RENDER LOGIC (Fixed Buttons) ---
function renderResources(items) {
    const container = document.getElementById('resourcesGrid');
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = '<div style="text-align: center; grid-column: 1/-1; padding: 2rem; background: #f9f9f9; border-radius: 8px;"><h3>No resources found</h3><p>Try selecting a "View All" or a different category.</p></div>';
        return;
    }

    items.forEach(res => {
        // Icon Logic
        let icon = '📄';
        const type = (res.type || '').toLowerCase();
        if (type.includes('housing') || type.includes('shelter')) icon = '🏠';
        else if (type.includes('medical') || type.includes('health')) icon = '⚕️';
        else if (type.includes('financial') || type.includes('money')) icon = '💰';
        else if (type.includes('legal')) icon = '⚖️';
        else if (type.includes('education')) icon = '🎓';
        else if (type.includes('food')) icon = '🍚';
        else if (type.includes('clothing')) icon = '👕';

        // Create Card Element
        const div = document.createElement('div');
        div.className = 'resource-card';
        div.style.cssText = "background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; transition: transform 0.2s;";

        div.onmouseover = () => div.style.transform = "translateY(-5px)";
        div.onmouseout = () => div.style.transform = "translateY(0)";

        // Set Inner HTML (Without Buttons)
        div.innerHTML = `
            <div class="resource-icon" style="font-size: 2rem; margin-bottom: 1rem;">${icon}</div>
            <h3 style="margin: 0 0 0.5rem 0; color: #333;">${res.title}</h3>
            <p style="color: #666; font-size: 0.95rem; margin-bottom: 1rem; flex-grow: 1;">${res.description || 'No description available.'}</p>
            
            <div class="resource-meta" style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
                <span style="background: #e3f2fd; color: #007bff; padding: 4px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: 600;">${res.type}</span>
                ${res.quantity ? `<span style="font-size: 0.85rem; color: #28a745;">${res.quantity} Units</span>` : ''}
            </div>
            
            <div class="resource-actions" style="margin-top: 1.5rem; display: flex; gap: 10px;">
                </div>
        `;

        // --- Programmatically Create Buttons (Fixes the "Not Working" Issue) ---
        const actionsDiv = div.querySelector('.resource-actions');

        // View Button
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn secondary small';
        viewBtn.style.flex = '1';
        viewBtn.textContent = 'View';
        viewBtn.onclick = () => openResourceModal(res); // Attach function directly
        actionsDiv.appendChild(viewBtn);

        // Request Button
        const reqBtn = document.createElement('button');
        reqBtn.className = 'btn primary small';
        reqBtn.style.flex = '1';
        reqBtn.textContent = 'Request';
        reqBtn.onclick = () => goToRequestPage(res.title); // Attach function directly
        actionsDiv.appendChild(reqBtn);

        container.appendChild(div);
    });
}

// --- MODAL & ACTIONS ---

function openResourceModal(res) {
    const modal = document.getElementById('resourceModal');
    if(!modal) return;

    // Populate Modal
    setText('modalTitle', res.title);
    setText('modalType', res.type);
    setText('modalDesc', res.description);
    setText('modalQty', res.quantity || 'N/A');

    // Configure "Request" button inside modal
    const modalBtn = document.getElementById('modalRequestBtn');
    if(modalBtn) {
        modalBtn.onclick = () => goToRequestPage(res.title);
    }

    modal.style.display = 'block';
}

function goToRequestPage(resourceTitle) {
    // Redirect to Request Help page, passing the item name
    window.location.href = `request-help.html?item=${encodeURIComponent(resourceTitle)}`;
}

function setupModal() {
    const modal = document.getElementById('resourceModal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close');
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';

    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = 'none';
    };
}

// --- FILTER LOGIC ---
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.filter-btn');
    const titleElement = document.getElementById('gridTitle');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const category = this.getAttribute('data-category');

            if (titleElement) {
                titleElement.textContent = category === 'all' ? 'All Resources' : `${capitalize(category)} Resources`;
            }

            let filtered = [];
            if (category === 'all') {
                filtered = allResources;
            } else {
                filtered = allResources.filter(item =>
                    (item.type || '').toLowerCase().includes(category)
                );
            }
            renderResources(filtered);

            const grid = document.getElementById('resourcesGrid');
            if(grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Helper Functions
function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}