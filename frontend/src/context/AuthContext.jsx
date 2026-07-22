import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../services/authService";
import { clearAuth, getStoredAuth, saveAuth } from "../utils/authStorage";
import { setAuthToken, clearAuthToken } from "../services/api";
import AuthContext from "./authContextObject";

export function AuthProvider({ children }) {
  const storedAuth = getStoredAuth();
  const [user, setUser] = useState(storedAuth?.user || null);
  const [token, setToken] = useState(storedAuth?.token || null);
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
          saveAuth({ token: savedAuth.token, user: currentUser });
        }
      } catch {
        clearAuth();
        clearAuthToken();
        if (active) {
          setUser(null);
          setToken(null);
        }
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
      clearAuthToken();
      setLoading(false);
    };

    const handleStorageChange = (e) => {
      if (e.key === "blood_net_auth" && !e.newValue) {
        handleUnauthorized();
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (authData, remember = true) => {
    setUser(authData.user || null);
    setToken(authData.token || null);
    setAuthToken(authData.token || null);
    saveAuth({ user: authData.user, token: authData.token }, remember);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthToken();
    clearAuth();
  };

  const value = useMemo(() => ({
    user,
    token,
    role: user?.role || null,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
  }), [user, token, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

