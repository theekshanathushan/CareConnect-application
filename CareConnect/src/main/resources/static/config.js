// API Configuration for CareConnect Disaster Relief Application
const CONFIG = {
    // Connected to Spring Boot Backend on Port 8080
    API_BASE_URL: 'http://localhost:8080/api',

    // API Endpoints
    ENDPOINTS: {
        // Authentication endpoints
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password'
        },

        // User management endpoints
        USERS: {
            // Profile Management
            PROFILE: '/users/profile',
            UPDATE_PROFILE: '/users/profile',
            CHANGE_PASSWORD: '/users/change-password',

            // User Lists for Chat & Admin
            GET_ALL: '/users/all',
            BY_ROLE: (role) => `/users/role/${role}`,
            DETAILS: (id) => `/users/${id}`
        },

        // Disaster relief endpoints
        DISASTER_RELIEF: {
            REQUESTS: '/requests/all',
            CREATE_REQUEST: '/requests/create',

            // Dynamic endpoints requiring IDs
            REQUEST_DETAILS: (id) => `/requests/${id}`,
            UPDATE_REQUEST: (id) => `/requests/${id}`,
            DELETE_REQUEST: (id) => `/requests/${id}`,

            // Specialized endpoints
            FILTER_REQUESTS: '/requests/filter',
            USER_REQUESTS: (userId) => `/requests/user/${userId}`,

            DONATIONS: '/donations',
            MAKE_DONATION: '/donations',
            DONATION_DETAILS: (id) => `/donations/${id}`,
            // Donation Status Update (for Government Dashboard)
            UPDATE_DONATION_STATUS: (id) => `/donations/${id}/status`,

            RESOURCES: '/resources',
            RESOURCE_DETAILS: (id) => `/resources/${id}`,

            VOLUNTEERS: '/volunteers',
            VOLUNTEER_SIGNUP: '/volunteers'
        },

        // Dashboard endpoints
        DASHBOARD: {
            // Stats Endpoints
            DONOR_STATS: '/dashboard/donor-stats',
            DISPLACED_STATS: '/dashboard/displaced-stats',
            GOVERNMENT_STATS: '/dashboard/government-stats',
            ADMIN_STATS: '/dashboard/admin-stats',

            // Activity Streams
            RECENT_ACTIVITY: '/dashboard/recent-activity',
            DISPLACED_ACTIVITY: '/dashboard/displaced-activity',
            ADMIN_ACTIVITY: '/dashboard/admin-activity',
            GOVERNMENT_ACTIVITY: '/dashboard/government-activity',
        },

        // Notifications
        NOTIFICATIONS: {
            GET_ALL: (userId) => `/notifications/${userId}`,
            GENERATE: (userId) => `/notifications/generate/${userId}`,
            MARK_READ: (id) => `/notifications/${id}/read`
        },

        // Communication (Chat)
        COMMUNICATION: {
            MESSAGES: '/messages',
            GET_MESSAGES: (userId) => `/messages/user/${userId}`,
            SEND_MESSAGE: '/messages/send',
            MESSAGE_HISTORY: (userId) => `/messages/history/${userId}`,
            GET_CONVERSATION: (u1, u2) => `/messages/conversation?userId1=${u1}&userId2=${u2}`
        },

        // Reports (Government/Admin)
        REPORTS: {
            DOWNLOAD: (type) => `/reports/download?type=${type}`,
            VIEW_DATA: (type) => `/reports/data?type=${type}`
        },

        // Resources Page
        RESOURCES: {
            ALL: '/resources/all'
        },

        // Administrative endpoints
        ADMIN: {
            USERS: '/admin/users',
            USER_DETAILS: (id) => `/admin/users/${id}`,

            // User Management Actions
            SUSPEND_USER: (id) => `/admin/users/${id}/suspend`,
            ACTIVATE_USER: (id) => `/admin/users/${id}/activate`,

            // System Logs & Stats
            // Updated to point to the dedicated ActivityLogController
            USER_ACTIVITIES: '/admin/activities',
            SYSTEM_STATS: '/admin/stats'
        }
    },

    // HTTP Headers
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

    // Timeout configuration (in milliseconds)
    TIMEOUT: 10000,

    // Retry configuration
    RETRY: {
        MAX_ATTEMPTS: 3,
        DELAY: 1000
    }
};

// Utility functions for API calls
const apiUtils = {
    // Get full URL for an endpoint
    getFullUrl: (endpoint) => {
        return `${CONFIG.API_BASE_URL}${endpoint}`;
    },

    // Get headers with optional authorization token
    getHeaders: (includeAuth = true) => {
        const headers = { ...CONFIG.HEADERS };

        if (includeAuth) {
            const token = localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    },

    // Handle API response
    handleResponse: async (response) => {
        // If response is a file download (CSV/PDF), return the blob/text directly
        const contentType = response.headers.get("content-type");
        if (contentType && (contentType.includes("csv") || contentType.includes("pdf") || contentType.includes("octet-stream"))) {
            return response;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }

        return response.json();
    },

    // Generic GET request
    get: async (url, includeAuth = true) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: apiUtils.getHeaders(includeAuth),
            timeout: CONFIG.TIMEOUT
        });

        return apiUtils.handleResponse(response);
    },

    // Generic POST request
    post: async (url, data, includeAuth = true) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: apiUtils.getHeaders(includeAuth),
            body: JSON.stringify(data),
            timeout: CONFIG.TIMEOUT
        });

        return apiUtils.handleResponse(response);
    },

    // Generic PUT request
    put: async (url, data, includeAuth = true) => {
        const response = await fetch(url, {
            method: 'PUT',
            headers: apiUtils.getHeaders(includeAuth),
            body: JSON.stringify(data),
            timeout: CONFIG.TIMEOUT
        });

        return apiUtils.handleResponse(response);
    },

    // Generic DELETE request
    delete: async (url, includeAuth = true) => {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: apiUtils.getHeaders(includeAuth),
            timeout: CONFIG.TIMEOUT
        });

        return apiUtils.handleResponse(response);
    }
};

// Export configuration and utility functions
export { CONFIG, apiUtils };