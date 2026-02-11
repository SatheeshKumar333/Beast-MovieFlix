/* =======================================
   BEAST MOVIEFLIX – CONFIGURATION
   Developed by Satheesh Kumar
======================================== */

// ===============================
// TMDB API Configuration
// ===============================
const TMDB_API_KEY = "84bbc1c699930f2c9f220c722da946b3";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_IMG_W185 = "https://image.tmdb.org/t/p/w185";
const TMDB_IMG_ORIGINAL = "https://image.tmdb.org/t/p/original";
const TMDB_IMG_H632 = "https://image.tmdb.org/t/p/h632";

// ===============================
// BACKEND CONFIGURATION
// ===============================
const BACKEND_URL = "https://beast-movieflix-14.onrender.com/api";

// Enable backend mode
let USE_BACKEND = true;


// ===============================
// Helper: Escape HTML
// ===============================
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ===============================
// API Request Helper
// ===============================
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("bmf_token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, config);

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn("Session expired or invalid.");
        return { success: false, error: "Unauthorized" };
      }
      throw new Error(data?.message || `HTTP ${response.status}`);
    }

    return { success: true, data: data || {} };

  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: error.message };
  }
}


// ===============================
// AUTH HELPERS
// ===============================
function isLoggedIn() {
  const logged = localStorage.getItem("bmf_logged") === "true";
  const token = localStorage.getItem("bmf_token");
  return logged && token;
}

function getAuthToken() {
  return localStorage.getItem("bmf_token");
}

function getCurrentUserId() {
  return localStorage.getItem("bmf_user_id");
}

function getCurrentUser() {
  return {
    id: localStorage.getItem("bmf_user_id"),
    username: localStorage.getItem("bmf_user"),
    email: localStorage.getItem("bmf_email"),
  };
}


// ===============================
// BACKEND HEALTH CHECK
// ===============================
async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}


// ===============================
// INIT CHECK
// ===============================
(async () => {
  USE_BACKEND = await checkBackendHealth();

  if (!USE_BACKEND) {
    console.warn("⚠️ Backend unavailable");
  } else {
    console.log("✅ Backend connected at", BACKEND_URL);
  }
})();
