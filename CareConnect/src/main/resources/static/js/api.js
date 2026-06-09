// API Utility Functions for CareConnect Application
import { CONFIG, apiUtils } from '../config.js';

// Authentication API functions
const AuthAPI = {
    // Login user
    async login(credentials) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.AUTH.LOGIN);
            const data = await apiUtils.post(url, credentials, false);
            // Store token in localStorage
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            return data;
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    },

    // Register user
    async register(userData) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.AUTH.REGISTER);
            const data = await apiUtils.post(url, userData, false);
            return data;
        } catch (error) {
            console.error('Registration API error:', error);
            throw error;
        }
    },

    // Logout user
    async logout() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.AUTH.LOGOUT);
            const data = await apiUtils.post(url, {}, true);
            // Clear token from localStorage
            localStorage.removeItem('authToken');
            return data;
        } catch (error) {
            console.error('Logout API error:', error);
            // Still clear token even if API call fails
            localStorage.removeItem('authToken');
            throw error;
        }
    },

    // Forgot password
    async forgotPassword(email) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD);
            const data = await apiUtils.post(url, { email }, false);
            return data;
        } catch (error) {
            console.error('Forgot password API error:', error);
            throw error;
        }
    },

    // Reset password
    async resetPassword(token, newPassword) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD);
            const data = await apiUtils.post(url, { token, newPassword }, false);
            return data;
        } catch (error) {
            console.error('Reset password API error:', error);
            throw error;
        }
    }
};

// User Profile API functions
const UserAPI = {
    // Get user profile
    async getProfile() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.USERS.PROFILE);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get profile API error:', error);
            throw error;
        }
    },

    // Update user profile
    async updateProfile(profileData) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE);
            const data = await apiUtils.put(url, profileData);
            return data;
        } catch (error) {
            console.error('Update profile API error:', error);
            throw error;
        }
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD);
            const data = await apiUtils.post(url, { currentPassword, newPassword });
            return data;
        } catch (error) {
            console.error('Change password API error:', error);
            throw error;
        }
    }
};

// Disaster Relief API functions
const DisasterReliefAPI = {
    // Get all requests
    async getRequests(filters = {}) {
        try {
            let url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DISASTER_RELIEF.REQUESTS);

            // Add query parameters if filters are provided
            if (Object.keys(filters).length > 0) {
                const queryParams = new URLSearchParams(filters).toString();
                url += `?${queryParams}`;
            }

            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get requests API error:', error);
            throw error;
        }
    },

    // Create a new request
    async createRequest(requestData) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DISASTER_RELIEF.CREATE_REQUEST);
            const data = await apiUtils.post(url, requestData);
            return data;
        } catch (error) {
            console.error('Create request API error:', error);
            throw error;
        }
    },

    // Get request details
    async getRequestDetails(id) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DISASTER_RELIEF.REQUEST_DETAILS(id));
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get request details API error:', error);
            throw error;
        }
    },

    // Update request
    async updateRequest(id, requestData) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DISASTER_RELIEF.UPDATE_REQUEST(id));
            const data = await apiUtils.put(url, requestData);
            return data;
        } catch (error) {
            console.error('Update request API error:', error);
            throw error;
        }
    },

    // Delete request
    async deleteRequest(id) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DISASTER_RELIEF.DELETE_REQUEST(id));
            const data = await apiUtils.delete(url);
            return data;
        } catch (error) {
            console.error('Delete request API error:', error);
            throw error;
        }
    },

    // Get all donations
    async getDonations() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DISASTER_RELIEF.DONATIONS);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get donations API error:', error);
            throw error;
        }
    },

    // Make a donation
    async makeDonation(donationData) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DISASTER_RELIEF.MAKE_DONATION);
            const data = await apiUtils.post(url, donationData);
            return data;
        } catch (error) {
            console.error('Make donation API error:', error);
            throw error;
        }
    },

    // Get all resources
    async getResources() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DISASTER_RELIEF.RESOURCES);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get resources API error:', error);
            throw error;
        }
    },

    // Get resource details
    async getResourceDetails(id) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DISASTER_RELIEF.RESOURCE_DETAILS(id));
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get resource details API error:', error);
            throw error;
        }
    }
};

// Dashboard API functions
const DashboardAPI = {
    // Get donor statistics
    async getDonorStats() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DASHBOARD.DONOR_STATS);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get donor stats API error:', error);
            throw error;
        }
    },

    // Get displaced person statistics
    async getDisplacedStats() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DASHBOARD.DISPLACED_STATS);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get displaced stats API error:', error);
            throw error;
        }
    },

    // Get government officer statistics
    async getGovernmentStats() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DASHBOARD.GOVERNMENT_STATS);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get government stats API error:', error);
            throw error;
        }
    },

    // Get admin statistics
    async getAdminStats() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.DASHBOARD.ADMIN_STATS);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get admin stats API error:', error);
            throw error;
        }
    }
};

// Communication API functions
const CommunicationAPI = {
    // Get messages
    async getMessages() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.COMMUNICATION.MESSAGES);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get messages API error:', error);
            throw error;
        }
    },

    // Send message
    async sendMessage(messageData) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.COMMUNICATION.SEND_MESSAGE);
            const data = await apiUtils.post(url, messageData);
            return data;
        } catch (error) {
            console.error('Send message API error:', error);
            throw error;
        }
    },

    // Get message history
    async getMessageHistory(userId) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.COMMUNICATION.MESSAGE_HISTORY(userId));
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get message history API error:', error);
            throw error;
        }
    },

    // Get notifications
    async getNotifications() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.COMMUNICATION.NOTIFICATIONS);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get notifications API error:', error);
            throw error;
        }
    },

    // Mark notification as read
    async markNotificationRead(id) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.COMMUNICATION.MARK_NOTIFICATION_READ(id));
            const data = await apiUtils.put(url, { read: true });
            return data;
        } catch (error) {
            console.error('Mark notification read API error:', error);
            throw error;
        }
    }
};

// Admin API functions
const AdminAPI = {
    // Get all users
    async getUsers() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.ADMIN.USERS);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get users API error:', error);
            throw error;
        }
    },

    // Get user details
    async getUserDetails(id) {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.ADMIN.USER_DETAILS(id));
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get user details API error:', error);
            throw error;
        }
    },

    // Get user activities
    async getUserActivities() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.ADMIN.USER_ACTIVITIES);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get user activities API error:', error);
            throw error;
        }
    },

    // Get system statistics
    async getSystemStats() {
        try {
            const url = apiUtils.getFullUrl(CONFIG.ENDPOINTS.ADMIN.SYSTEM_STATS);
            const data = await apiUtils.get(url);
            return data;
        } catch (error) {
            console.error('Get system stats API error:', error);
            throw error;
        }
    }
};

// Export all API modules
export {
    AuthAPI,
    UserAPI,
    DisasterReliefAPI,
    DashboardAPI,
    CommunicationAPI,
    AdminAPI
};