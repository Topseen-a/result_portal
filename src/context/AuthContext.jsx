import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { login as loginRequest, getMe } from "../api/endpoints";
import { storeSession, clearSession, getStoredUser, getAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!getAccessToken()) {
      setProfile(null);
      return null;
    }
    try {
      const me = await getMe();
      setProfile(me);
      return me;
    } catch {
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (getAccessToken()) {
      refreshProfile().finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, [refreshProfile]);

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password);
    // Backend response shape: { user: { id, email, username, role, access, refresh } }
    const { access, refresh, ...userData } = data.user || data;
    storeSession({ access, refresh, ...userData });
    setUser(userData);
    await refreshProfile();
    return userData;
  }, [refreshProfile]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setProfile(null);
  }, []);

  const isAuthenticated = Boolean(user && getAccessToken());

  return (
    <AuthContext.Provider
      value={{ user, profile, login, logout, isAuthenticated, initializing, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
