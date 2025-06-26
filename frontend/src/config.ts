// Basic configuration for the frontend application

// Backend API URL
// The Python Flask backend runs on port 5000 by default as per app.py
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Other frontend specific configurations can go here
// For example, feature flags, UI settings, etc.

console.log("API Base URL:", API_BASE_URL); // For debugging during development
