import axios from "axios";
import { clearAuth, getStoredAuth, getStoredRefreshToken } from "../utils/authStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

let activeToken = null;
let isRefreshing = false;
let failedQueue = [];

export function setAuthToken(token) {
  activeToken = token;
}

export function clearAuthToken() {
  activeToken = null;
}

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  try {
    const token = activeToken || getStoredAuth()?.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Failed to attach auth token to request", err);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      error.handledMessage = "Unable to reach the server. Check your internet connection.";
      return Promise.reject(error);
    }

    const status = error.response.status;
    const originalRequest = error.config;

    if (status === 401 && !originalRequest._retry) {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        clearAuth();
        window.dispatchEvent(new Event("auth:unauthorized"));
        error.handledMessage = "Session expired. Please log in again.";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const newToken = response.data.access_token;
        setAuthToken(newToken);
        const stored = getStoredAuth();
        if (stored) {
          const storageKey = "blood_net_auth";
          const storageData = { ...stored, token: newToken };
          try {
            sessionStorage.setItem(storageKey, JSON.stringify(storageData));
            localStorage.setItem(storageKey, JSON.stringify(storageData));
          } catch {}
        }
        window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: { token: newToken } }));
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.dispatchEvent(new Event("auth:unauthorized"));
        error.handledMessage = "Session expired. Please log in again.";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      error.handledMessage = "You do not have permission to perform this action.";
    } else if (status === 404) {
      error.handledMessage = "Requested resource was not found.";
    } else if (status === 422) {
      error.handledMessage = "Please check the information you entered.";
    } else if (status >= 500) {
      error.handledMessage = "Server error. Please try again later.";
    }

    return Promise.reject(error);
  }
);

export default api;
