import { CONFIG } from '../../config.js';

// Static list of available report types (Backend generates the actual data on demand)
const AVAILABLE_REPORTS = [
    { id: 1, title: "All Help Requests", type: "general", category: "General", date: new Date().toISOString(), description: "Complete list of all help requests with applicant details." },
    { id: 2, title: "Resource Inventory", type: "resource", category: "Resource", date: new Date().toISOString(), description: "Current stock levels and locations of relief resources." }
];

document.addEventListener('DOMContentLoaded', function() {
    // 1. Check Auth
    const role = localStorage.getItem('userRole');
    if (role !== 'government' && role !== 'admin') {
        window.location.href = '../login.html';
        return;
    }

    // 2. Load the list of report options
    loadReports(AVAILABLE_REPORTS);

    // 3. Setup Generate Button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const type = document.getElementById('report-type').value;
            if(type) {
                // Map frontend values to backend expected types
                let downloadType = "general";
                if (type === "resource") downloadType = "resource";

                downloadReport(downloadType);
            } else {
                alert("Please select a report type first.");
            }
        });
    }

    // 4. Reset Button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('report-type').selectedIndex = 0;
            document.getElementById('date-range').selectedIndex = 0;
        });
    }
});

function loadReports(reports) {
    const container = document.getElementById('govReportsList');
    if (!container) return;
    container.innerHTML = '';

    reports.forEach(report => {
        const div = document.createElement('div');
        div.className = 'report-item';
        div.innerHTML = `
            <div class="report-header">
                <div class="report-icon">📊</div>
                <div class="report-meta">
                    <h3>${report.title}</h3>
                    <span class="report-date">Date: ${new Date(report.date).toLocaleDateString()}</span>
                </div>
            </div>
            <p class="report-description">${report.description}</p>
            <div class="report-details">
                <div class="detail-item"><span class="detail-label">Type:</span><span>${report.category}</span></div>
                <div class="detail-item"><span class="detail-label">Format:</span><span>CSV</span></div>
            </div>
            <div class="report-actions">
                <button class="btn secondary small" onclick="downloadReport('${report.type}')">Download CSV</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// --- GLOBAL DOWNLOAD FUNCTION ---
// Triggers the browser to download the file from the API
window.downloadReport = function(type) {
    // Construct the API URL (ensure port matches your backend, usually 8080)
    const downloadUrl = `http://localhost:8080/api/reports/download?type=${type}`;

    // Create a temporary hidden link to trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', ''); // Browser handles filename from headers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Placeholder for View (since CSVs are usually downloaded, not viewed inline)
window.viewReport = function(title) {
    alert("Please download the CSV file to view the full report data.");
};