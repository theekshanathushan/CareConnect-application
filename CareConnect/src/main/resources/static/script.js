// Basic interactivity for the CareConnect index page
import { CONFIG, apiUtils } from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize feature card animations
    const featureCardsInit = document.querySelectorAll('.feature-card');
    featureCardsInit.forEach(card => {
        card.style.opacity = '0';
    });

    // Trigger feature card animations after a delay
    setTimeout(() => {
        featureCardsInit.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
            }, index * 200);
        });
    }, 500);

    // --- HOME PAGE BUTTONS ---
    // UPDATED: Use specific selectors (.cta-buttons) to avoid conflicts with Login/Register forms
    const requestHelpBtn = document.querySelector('.cta-buttons .btn.primary');
    const offerHelpBtn = document.querySelector('.cta-buttons .btn.secondary');

    // Add event listeners to buttons if they exist
    if (requestHelpBtn) {
        requestHelpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirect to register page with displaced person role pre-selected
            // UPDATED: changed 'displaced-person' to 'displaced' to match register.html logic
            window.location.href = 'register.html?role=displaced';
        });
    }

    if (offerHelpBtn) {
        offerHelpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Redirect to register page with donator role pre-selected
            window.location.href = 'register.html?role=donator';
        });
    }

    // --- NAVIGATION SMOOTH SCROLL ---
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Only prevent default if it's an anchor link (starts with #)
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- SCROLL ANIMATIONS ---
    const featureCards = document.querySelectorAll('.feature-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    featureCards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
});

// Simple form validation placeholder
function validateForm(formType) {
    // In a real implementation, this would contain actual form validation logic
    console.log(`Validating ${formType} form`);
    return true;
}

// Example API call functions using the config
async function loginUser(credentials) {
    try {
        const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.AUTH.LOGIN);
        const data = await apiUtils.post(url, credentials, false);
        // Store token in localStorage
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function registerUser(userData) {
    try {
        const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.AUTH.REGISTER);
        const data = await apiUtils.post(url, userData, false);
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

async function getUserProfile() {
    try {
        const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.USERS.PROFILE);
        const data = await apiUtils.get(url);
        return data;
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        throw error;
    }
}

// Export functions if needed by other modules
export { loginUser, registerUser, getUserProfile, validateForm };