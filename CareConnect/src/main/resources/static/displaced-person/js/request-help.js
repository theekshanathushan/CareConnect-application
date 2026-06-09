import { CONFIG, apiUtils } from '../../config.js';

document.addEventListener('DOMContentLoaded', function() {

    // 1. Handle Pre-fill from Resources Page (e.g., ?item=Rice)
    const urlParams = new URLSearchParams(window.location.search);
    const itemToRequest = urlParams.get('item');

    if (itemToRequest) {
        // Pre-fill Description
        const descField = document.getElementById('description');
        if (descField) {
            descField.value = `I would like to request: ${itemToRequest}.`;
        }

        // Attempt to auto-select the Request Type
        const typeSelect = document.getElementById('requestType');
        if(typeSelect) {
            const lowerItem = itemToRequest.toLowerCase();
            if(lowerItem.includes('food') || lowerItem.includes('rice') || lowerItem.includes('water')) typeSelect.value = 'Food';
            else if(lowerItem.includes('medical') || lowerItem.includes('health') || lowerItem.includes('medicine')) typeSelect.value = 'Medical';
            else if(lowerItem.includes('house') || lowerItem.includes('shelter') || lowerItem.includes('tent')) typeSelect.value = 'Shelter';
            else if(lowerItem.includes('cloth')) typeSelect.value = 'Clothing';
        }
    }

    const helpRequestForm = document.getElementById('helpRequestForm');

    // 2. Auto-fill Contact Name if User is Logged In
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
        const contactNameInput = document.getElementById('contactName');
        if (contactNameInput) contactNameInput.value = storedUserName;
    }

    if (helpRequestForm) {
        helpRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Processing...";

            // 3. Check Authentication
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert("You must be logged in to submit a request.");
                window.location.href = "../login.html";
                return;
            }

            try {
                // 4. Handle Image Processing (Convert to Base64)
                const fileInput = document.getElementById('evidenceImage');
                let base64Image = null;

                if (fileInput && fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    // Client-side validation: Limit size to 1MB
                    if (file.size > 1048576) {
                        throw new Error("The selected image is too large. Please select an image under 1MB.");
                    }
                    base64Image = await convertToBase64(file);
                }

                // 5. CAPTURE GPS LOCATION (New for Live Map)
                let lat = null;
                let lng = null;
                try {
                    // This asks the user for permission to use their location
                    const position = await getCurrentPosition();
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    console.log("Location captured:", lat, lng);
                } catch (locError) {
                    console.warn("Location access denied or failed. Proceeding without GPS data.", locError);
                    // We continue submitting even if location fails (optional)
                }

                // 6. Prepare Data Object (Matches HelpRequest.java)
                const requestData = {
                    userId: parseInt(userId),

                    // --- New Details ---
                    identityNumber: getValue('identityNumber'),
                    homeNumber: getValue('homeNumber'),
                    district: getValue('district'),
                    town: getValue('town'),
                    evidenceImage: base64Image, // Base64 String

                    // --- Standard Details ---
                    requestType: getValue('requestType'),
                    urgency: getValue('urgency'),
                    quantity: parseInt(getValue('quantity') || 1),
                    timeframe: getValue('timeframe'),
                    description: getValue('description'),

                    // --- Location Data ---
                    location: getValue('location') || getValue('town'), // Text Address
                    latitude: lat,  // GPS Latitude
                    longitude: lng, // GPS Longitude

                    contactName: getValue('contactName'),
                    contactPhone: getValue('contactPhone'),

                    status: "Pending" // Explicitly set initial status
                };

                // 7. Send to Backend
                const url = `${CONFIG.API_BASE_URL}/requests/create`;
                const response = await apiUtils.post(url, requestData);

                if (response) {
                    alert("Your help request has been submitted successfully!");
                    helpRequestForm.reset();
                    // Redirect to 'My Requests' to see the status
                    window.location.href = "my-requests.html";
                }

            } catch (error) {
                console.error("Request error:", error);
                alert("Error submitting request: " + (error.message || "Unknown error"));
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});

// Helper to safely get value by ID
function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

// Helper function to convert File object to Base64 string
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Helper function to get Geolocation (Promisified)
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported by this browser."));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true, // Request best possible accuracy
                timeout: 5000,            // Wait max 5 seconds
                maximumAge: 0             // Do not use cached location
            });
        }
    });
}