import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "disasterwatch_auth_session";

// Default emergency analyst user for immediate demo evaluation
const DEFAULT_USER = {
  id: "USR-NDMA-092",
  name: "Cmdr. Harshdeep Singh",
  email: "h.singh@ndma.gov.in",
  role: "Analyst", // "Admin" | "Analyst" | "Responder"
  organization: "National Disaster Management Authority (NDMA)",
  badgeNumber: "IND-EOC-2026",
  demoMode: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_USER;
  });

  const [authNotice, setAuthNotice] = useState(
    "Demo Mode: Backend user auth service pending; local secure session active."
  );

  const signIn = async ({ email, password, rememberMe }) => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Never store password!
    const userData = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: email.split("@")[0].replace(".", " ").toUpperCase(),
      email,
      role: "Analyst",
      organization: "Emergency Operations Center",
      badgeNumber: `EOC-${Math.floor(1000 + Math.random() * 9000)}`,
      demoMode: true,
      token: `sim_token_${Math.random().toString(36).substring(2)}`,
    };

    setUser(userData);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return { success: true };
  };

  const signUp = async ({ name, email, password, role }) => {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const userData = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role: role || "Analyst",
      organization: "State Emergency Response Force (SDRF)",
      badgeNumber: `SDRF-${Math.floor(1000 + Math.random() * 9000)}`,
      demoMode: true,
      token: `sim_token_${Math.random().toString(36).substring(2)}`,
    };

    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return { success: true };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isDemoAuth: true,
        authNotice,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
