// API Configuration
// Change this to switch between local development and production

const API_CONFIG = {
  // For local development (XAMPP)
  LOCAL: "http://localhost/soil/app/API",
    // For production (Render.com)
  PRODUCTION: "https://soil-3tik.onrender.com/API"
};

// Set which environment to use
export const API_BASE_URL = API_CONFIG.PRODUCTION; // Change to API_CONFIG.PRODUCTION for production
