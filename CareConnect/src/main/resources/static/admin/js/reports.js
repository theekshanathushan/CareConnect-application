import { CONFIG, apiUtils } from '../../config.js';

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Authentication
    const role = localStorage.getItem('userRole');
    if (role !== 'admin' && role !== 'government') {
        window.location.href = '../login.html';
        return;
    }

    setupEventListeners();
});

function setupEventListeners() {
    const generateBtn = document.getElementById('generateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const exportBtn = document.getElementById('exportAllBtn');

    // Handle "Generate Report" Button Click
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const type = document.getElementById('report-type').value;
            if (!type) {
                alert("Please select a Report Type first.");
                return;
            }
            createReportEntry(type);
        });
    }

    // Handle "Reset" Button Click
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('report-type').selectedIndex = 0;
            document.getElementById('reportsListContainer').innerHTML =
                '<div style="text-align:center; padding:2rem; color:#666;">Select a type above and click "Generate Report".</div>';
        });
    }

    // Handle "Export All" Button Click
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // Default behavior: Export the General Activity report
            downloadCsv('Activity');
        });
    }
}

/**
 * Creates a visual card in the UI representing the generated report.
 * This does not fetch data yet; data is fetched when the user clicks specific action buttons.
 */
function createReportEntry(type) {
    const container = document.getElementById('reportsListContainer');

    // Clear the "Loading/Empty" message if it exists
    if (container.innerHTML.includes('Select a type')) {
        container.innerHTML = '';
    }

    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();

    // Determine description based on type
    let desc = "Detailed system report.";
    if(type === 'Resource') desc = "Current inventory levels and warehouse locations.";
    if(type === 'Activity') desc = "User logins, help requests, and system actions.";
    if(type === 'Financial') desc = "Summary of monetary donations and aid distribution.";

    const div = document.createElement('div');
    div.className = 'report-item';
    div.innerHTML = `
        <div class="report-header">
            <div class="report-icon">📊</div>
            <div class="report-meta">
                <h3>${type} Report</h3>
                <span class="report-date">Generated: ${dateStr} at ${timeStr}</span>
            </div>
        </div>
        <p class="report-description">${desc}</p>
        <div class="report-actions">
            <button class="btn secondary small" onclick="window.viewReportData('${type}')">View Data</button>
            <button class="btn primary small" onclick="window.generatePdf('${type}')">Download PDF</button>
            <button class="btn secondary small" onclick="window.downloadCsv('${type}')">Export CSV</button>
        </div>
    `;

    // Add new report to the top of the list
    container.insertBefore(div, container.firstChild);
}

// =========================================================
// --- ACTION HANDLERS (Attached to Window for HTML access) ---
// =========================================================

/**
 * 1. VIEW: Fetches JSON data from backend and displays it in the Modal
 */
window.viewReportData = async function(type) {
    try {
        // Fetch JSON data from backend
        // Endpoint: /api/reports/data?type={type}
        const data = await apiUtils.get(`${CONFIG.API_BASE_URL}/reports/data?type=${type}`);
        showModal(type, data);
    } catch (error) {
        console.error("Error fetching report data:", error);
        alert("Failed to load report data from server.");
    }
};

/**
 * 2. EXPORT: Triggers a direct file download from the Backend (CSV)
 */
window.downloadCsv = function(type) {
    const token = localStorage.getItem('authToken');
    // Endpoint: /api/reports/download?type={type}
    const url = `${CONFIG.API_BASE_URL}/reports/download?type=${type}`;

    // Create a temporary link to trigger the browser's download behavior
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * 3. PDF: Fetches JSON data and generates a PDF client-side
 */
window.generatePdf = async function(type) {
    try {
        // Fetch fresh data
        const data = await apiUtils.get(`${CONFIG.API_BASE_URL}/reports/data?type=${type}`);

        if (!data || data.length === 0) {
            alert("No data available to generate PDF.");
            return;
        }

        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add Header
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80); // Dark Blue
        doc.text(`CareConnect - ${type} Report`, 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Generated by: ${localStorage.getItem('userName') || 'Admin'}`, 14, 36);

        // Prepare Table Data dynamically
        // 1. Extract Headers from the first object keys
        const headers = Object.keys(data[0]).map(key => key.toUpperCase());

        // 2. Map object values to rows
        const rows = data.map(obj => Object.values(obj));

        // Use AutoTable plugin to draw the table
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80] },
            styles: { fontSize: 8 }
        });

        // Save file
        doc.save(`CareConnect_${type}_Report.pdf`);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Error generating PDF. Ensure you have data and the PDF library is loaded.");
    }
};

// --- HELPER: Show Data in Modal ---
function showModal(title, data) {
    const modal = document.getElementById('viewModal');
    const modalTitle = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');

    modalTitle.innerText = `${title} Report Data`;

    if (!data || data.length === 0) {
        content.innerHTML = '<p style="text-align:center; padding:20px;">No records found for this report type.</p>';
    } else {
        // Build a simple HTML Table
        let tableHtml = '<table style="width:100%; border-collapse: collapse; font-size:0.85em; font-family: sans-serif;">';

        // Table Head
        tableHtml += '<thead><tr style="background:#f1f3f5; color:#495057;">';
        Object.keys(data[0]).forEach(key => {
            tableHtml += `<th style="padding:10px; border:1px solid #dee2e6; text-transform:capitalize;">${key}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';

        // Table Body
        data.forEach(row => {
            tableHtml += '<tr>';
            Object.values(row).forEach(val => {
                // Handle objects/nulls gracefully
                let displayVal = val;
                if(val === null) displayVal = '-';
                if(typeof val === 'object') displayVal = JSON.stringify(val);

                tableHtml += `<td style="padding:8px; border:1px solid #dee2e6;">${displayVal}</td>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';

        content.innerHTML = tableHtml;
    }

    modal.style.display = 'flex'; // Uses flex to center as defined in CSS
}