import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // ✅ 30s timeout — Render free tier wakes up slowly
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // ✅ Auto logout on 401 — token expired or invalid
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }

      // ✅ Log error message from your GlobalExceptionHandler
      console.error("API Error:", error.response.data?.message || error.message);

    } else if (error.code === "ECONNABORTED") {
      // ✅ Timeout — Render backend waking up
      console.error("Request timeout — server may be waking up, please retry");

    } else {
      // ✅ Network error
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;