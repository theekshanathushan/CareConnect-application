import { CONFIG } from '../../config.js';

document.addEventListener('DOMContentLoaded', function() {
    const donationForm = document.getElementById('donationForm');

    // 1. Auto-fill User Information
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
        const names = storedUserName.split(' ');
        if(names.length > 0) {
            const fNameInput = document.getElementById('firstName');
            if(fNameInput) fNameInput.value = names[0];
        }
        if(names.length > 1) {
            const lNameInput = document.getElementById('lastName');
            if(lNameInput) lNameInput.value = names.slice(1).join(' ');
        }
    }

    // 2. Handle URL Parameters (Pre-fill Cause & Link Request ID)
    // Example URL: donate.html?cause=Food&ref=15
    const urlParams = new URLSearchParams(window.location.search);
    const preFilledCause = urlParams.get('cause');
    const requestId = urlParams.get('ref');

    if (preFilledCause) {
        const causeSelect = document.getElementById('cause');
        // Add option dynamically if it doesn't exist, to ensure it shows up
        let optionExists = false;
        for (let i = 0; i < causeSelect.options.length; i++) {
            if (causeSelect.options[i].value === preFilledCause) {
                causeSelect.selectedIndex = i;
                optionExists = true;
                break;
            }
        }
        if (!optionExists) {
            const opt = document.createElement('option');
            opt.value = preFilledCause;
            opt.innerHTML = preFilledCause;
            opt.selected = true;
            causeSelect.appendChild(opt);
        }
        // Open the form automatically if redirected
        showDonationForm('one-time');
    }

    // 3. Handle Nickname Visibility
    const nicknameRadio = document.getElementById('nickname');
    const nicknameField = document.getElementById('nicknameField');
    if (nicknameRadio && nicknameField) {
        document.querySelectorAll('input[name="visibility"]').forEach(radio => {
            radio.addEventListener('change', function() {
                nicknameField.style.display = (this.value === 'nickname') ? 'block' : 'none';
            });
        });
    }

    // 4. Handle Form Submission
    if (donationForm) {
        donationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Processing...";

            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert("Please log in to donate.");
                window.location.href = "../login.html";
                return;
            }

            // Construct Data
            const donationData = {
                donorId: parseInt(userId),
                donorName: document.getElementById('firstName').value + " " + document.getElementById('lastName').value,
                cause: document.getElementById('cause').value,
                donationType: document.getElementById('donationType').value,
                amount: parseFloat(document.getElementById('amount').value),
                contactNumber: document.getElementById('phone').value,
                description: document.getElementById('message').value || "No message provided",

                // IMPORTANT: Send the Linked Request ID
                requestId: requestId ? parseInt(requestId) : null
            };

            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/dashboard/donate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(donationData)
                });

                if (response.ok) {
                    alert(`Thank you! Your donation has been successfully processed.`);
                    donationForm.reset();
                    window.location.href = "dashboard.html";
                } else {
                    const errorText = await response.text();
                    alert("Error processing donation: " + errorText);
                }
            } catch (error) {
                console.error("Donation error:", error);
                alert("Failed to connect to the server.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // Global Helpers
    window.showDonationForm = function(type) {
        const container = document.getElementById('donationFormContainer');
        if (container) {
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.hideDonationForm = function() {
        const container = document.getElementById('donationFormContainer');
        if (container) container.style.display = 'none';
    };
});