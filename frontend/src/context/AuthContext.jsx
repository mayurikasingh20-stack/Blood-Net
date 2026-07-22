import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../services/authService";
import { clearAuth, getStoredAuth, saveAuth } from "../utils/authStorage";
import { setAuthToken, clearAuthToken } from "../services/api";
import AuthContext from "./authContextObject";

export function AuthProvider({ children }) {
  const storedAuth = getStoredAuth();
  const [user, setUser] = useState(storedAuth?.user || null);
  const [token, setToken] = useState(storedAuth?.token || null);
  const [refreshToken, setRefreshToken] = useState(storedAuth?.refreshToken || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      const savedAuth = getStoredAuth();
      if (!savedAuth?.token) {
        if (active) setLoading(false);
        return;
      }

      setAuthToken(savedAuth.token);

      try {
        const currentUser = await getCurrentUser();
        if (active) {
          setUser(currentUser);
          setToken(savedAuth.token);
          saveAuth({ token: savedAuth.token, refreshToken: savedAuth.refreshToken, user: currentUser });
        }
      } catch {
        return;
      } finally {
        if (active) setLoading(false);
      }
    }

    checkAuthentication();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      clearAuthToken();
      setLoading(false);
    };

    const handleStorageChange = (e) => {
      if (e.key === "blood_net_auth" && !e.newValue) {
        handleUnauthorized();
      }
    };

    const handleTokenRefreshed = (e) => {
      if (e.detail?.token) {
        setToken(e.detail.token);
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (authData, remember = true) => {
    setUser(authData.user || null);
    setToken(authData.token || null);
    setRefreshToken(authData.refreshToken || null);
    setAuthToken(authData.token || null);
    saveAuth({ user: authData.user, token: authData.token, refreshToken: authData.refreshToken }, remember);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    clearAuthToken();
    clearAuth();
  };

  const value = useMemo(() => ({
    user,
    token,
    refreshToken,
    role: user?.role || null,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
  }), [user, token, refreshToken, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

