import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Mock user for testing — no Google auth, no API calls needed
const MOCK_USER = {
  name: "",
  email: "",
  phone: "",
  location: "",
  avatar: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token] = useState("mock_token_for_testing");

  const signInWithGoogle = async () => {
    setUser(MOCK_USER);
  };

  const signOut = () => {
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    return updated;
  };

  const isAuthenticated = Boolean(user);
  const profileComplete = Boolean(user?.name && user?.phone && user?.location);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading: false,
        isAuthenticated,
        profileComplete,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile: async () => user,
      }}
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
