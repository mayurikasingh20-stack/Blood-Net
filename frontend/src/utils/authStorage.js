export const AUTH_STORAGE_KEY = "blood_net_auth";

export function getStoredAuth() {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY)) || JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuth(authData, remember = true) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  if (remember) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredRefreshToken() {
  try {
    const data = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) ||
                 JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY));
    return data?.refreshToken || null;
  } catch {
    return null;
  }
}
