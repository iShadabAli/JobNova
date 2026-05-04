// ============================================
// JobNova API Configuration
// Centralized API URL mapping for all endpoints
// ============================================

// Base URL — reads from environment variable, falls back to localhost for dev
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Remove trailing /api if present (so we can add it per-endpoint)
const BASE_URL = API_BASE.endsWith('/api') 
  ? API_BASE.slice(0, -4) 
  : API_BASE;

// ============================================
// API Endpoint Mapping
// ============================================
const API = {
  // Base URL (without /api)
  BASE: BASE_URL,

  // Auth
  AUTH: {
    LOGIN:    `${BASE_URL}/api/auth/login`,
    REGISTER: `${BASE_URL}/api/auth/register`,
  },

  // Jobs
  JOBS: {
    BASE:     `${BASE_URL}/api/jobs`,
    BY_ID:    (id) => `${BASE_URL}/api/jobs/${id}`,
    APPLY:    (id) => `${BASE_URL}/api/jobs/${id}/apply`,
  },

  // Profile
  PROFILE: {
    BASE:     `${BASE_URL}/api/profile`,
    BY_ID:    (id) => `${BASE_URL}/api/profile/${id}`,
    UPDATE:   `${BASE_URL}/api/profile`,
  },

  // Reviews
  REVIEWS: {
    BASE:     `${BASE_URL}/api/reviews`,
    BY_USER:  (id) => `${BASE_URL}/api/reviews/user/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE:     `${BASE_URL}/api/notifications`,
  },

  // Chat
  CHAT: {
    BASE:         `${BASE_URL}/api/chat`,
    CONVERSATIONS:`${BASE_URL}/api/chat/conversations`,
    BY_ID:        (id) => `${BASE_URL}/api/chat/conversations/${id}`,
    MESSAGES:     (id) => `${BASE_URL}/api/chat/conversations/${id}/messages`,
  },

  // Time Exchange
  TIME_EXCHANGE: {
    BASE:     `${BASE_URL}/api/time-exchange`,
    BY_ID:    (id) => `${BASE_URL}/api/time-exchange/${id}`,
  },

  // Bookings
  BOOKINGS: {
    BASE:     `${BASE_URL}/api/bookings`,
    BY_ID:    (id) => `${BASE_URL}/api/bookings/${id}`,
  },

  // International Jobs
  INTERNATIONAL_JOBS: {
    BASE:     `${BASE_URL}/api/international-jobs`,
    BY_ID:    (id) => `${BASE_URL}/api/international-jobs/${id}`,
  },

  // Scholarships
  SCHOLARSHIPS: {
    BASE:     `${BASE_URL}/api/scholarships`,
    BY_ID:    (id) => `${BASE_URL}/api/scholarships/${id}`,
  },

  // Complaints
  COMPLAINTS: {
    BASE:     `${BASE_URL}/api/complaints`,
  },

  // Contact
  CONTACT: {
    BASE:     `${BASE_URL}/api/contact`,
  },

  // Admin
  ADMIN: {
    BASE:     `${BASE_URL}/api/admin`,
  },

  // Health Check
  HEALTH:     `${BASE_URL}/api/health`,
};

export default API;
export { BASE_URL, API_BASE };
