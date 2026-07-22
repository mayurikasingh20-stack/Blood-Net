import axios from "axios";
import { clearAuth, getStoredAuth } from "../utils/authStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

let activeToken = null;

export function setAuthToken(token) {
  activeToken = token;
}

export function clearAuthToken() {
  activeToken = null;
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
  (error) => {
    if (!error.response) {
      error.handledMessage = "Unable to reach the server. Check your internet connection.";
      return Promise.reject(error);
    }

    const status = error.response.status;
    if (status === 401) {
      clearAuth();
      window.dispatchEvent(new Event("auth:unauthorized"));
      error.handledMessage = "Session expired. Please log in again.";
    } else if (status === 403) {
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
