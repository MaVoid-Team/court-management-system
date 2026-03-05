import axios from "axios";

// Create instance with base URL
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        // Only access localStorage if we are in the browser
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("auth_token");
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login if unauthorized
            if (typeof window !== "undefined") {
                localStorage.removeItem("auth_token");
                // Don't redirect if we're already on the login page
                if (!window.location.pathname.includes("/auth/login")) {
                    window.location.href = "/auth/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
