import { createContext, useContext, useState } from "react";
import { getMe } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const loginCtx = async (token, userData) => {
    localStorage.setItem("access_token", token);

    const role = localStorage.getItem("role");

    try {
      if (role === "owner") {
      // owner doesn't have /users/me
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } else {
        const meRes = await getMe();
        localStorage.setItem("user", JSON.stringify(meRes.data));
        setUser(meRes.data);
      }
    } catch (err) {
      console.error("Profile load failed:", err);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
  };
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginCtx,
        logout,
        updateUser,
        isLoggedIn: !!localStorage.getItem("access_token"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);