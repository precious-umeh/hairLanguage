"use client";

import { useContext, createContext, useState, useEffect } from "react";
import server from "@/app/(main)/utils/axiosClient";
import { usePathname } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    avatar: null,
  });
  const [preview, setPreview] = useState(null);

  function normalizeUser(data) {
    if (!data) return data;
    return {
      ...data,
      twofactor: data.twofactor || { enabled: false },
    };
  }

  // Clear Registration Data
  function clearRegistrationData() {
    setUserData({ fullName: "", email: "", password: "", avatar: null });
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  // Persistence: check for user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedSessionId = localStorage.getItem("currentSessionId");
    if (storedUser && storedToken) {
      setToken(storedToken);
      setUser(normalizeUser(JSON.parse(storedUser)));
      setCurrentSessionId(storedSessionId);
    }
  }, []);

  // login function
  async function login(credentials, type = "user") {
    try {
      setLoading(true);

      const endpoint = type === "admin" ? "/auth/login-admin" : "/auth/login";
      const payload = { ...credentials, requiredRole: type };
      const response = await server.post(endpoint, payload);

      if (response.data.require2FA) {
        return {
          success: false,
          require2FA: true,
          userId: response.data.userId,
        };
      }

      const userData = normalizeUser(response.data.user);
      const userToken = response.data.token;
      const sessionId = response.data.currentSessionId;

      setToken(userToken);
      setUser(userData);
      setCurrentSessionId(sessionId);

      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("currentSessionId", sessionId);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        needsVerification: error.response?.data?.needsVerification || false,
      };
    } finally {
      setLoading(false);
    }
  }

  // 2FA Verifcation Login Function
  async function verify2FALogin(userId, code) {
    setLoading(true);
    try {
      const response = await server.post("/auth/2fa/verify-login", {
        userId,
        code,
      });

      const userData = normalizeUser(response.data.user);
      const userToken = response.data.token;
      const sessionId = response.data.currentSessionId;

      setToken(userToken);
      setUser(userData);
      setCurrentSessionId(sessionId);

      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("currentSessionId", sessionId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "2FA Verification failed.",
      };
    } finally {
      setLoading(false);
    }
  }

  // logout function
  async function logout() {
    try {
      await server.post("/auth/logout");
    } catch (error) {
      console.error("Backend Logout Failed: ", error);
    } finally {
      setToken(null);
      setUser(null);
      setCurrentSessionId(null);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("currentSessionId");

      clearRegistrationData();
    }
  }

  // login users with their data after otp verification
  function setAuthData(userData, userToken, sessionId) {
    setToken(userToken);
    setUser(normalizeUser(userData));
    const nextSessionId = sessionId ?? currentSessionId;
    setCurrentSessionId(nextSessionId);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(normalizeUser(userData)));
    if (nextSessionId) {
      localStorage.setItem("currentSessionId", nextSessionId);
    }
  }

  // fetchMe function
  useEffect(() => {
    async function fetchMe() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await server.get("/auth/me");
        setUser(normalizeUser(response.data.user));
      } catch (error) {
        console.error("Session expired or Invalid token: ", error);
        await logout();

        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        verify2FALogin,
        logout,
        loading,
        setAuthData,
        userData,
        setUserData,
        preview,
        setPreview,
        clearRegistrationData,
        currentSessionId,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/*
  async function login(credentials, type = "user") {
    try {
      setLoading(true);

      const endpoint = type === "admin" ? "/auth/login-admin" : "/auth/login";
      const payload = { ...credentials, requiredRole: type };
      const response = await server.post(endpoint, payload);

      const userData = response.data.user;
      const userToken = response.data.token;
      const sessionId = response.data.currentSessionId;

      setToken(userToken);
      setUser(userData);
      setCurrentSessionId(sessionId);

      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("currentSessionId", sessionId);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        needsVerification: error.response?.data?.needsVerification || false,
      };
    } finally {
      setLoading(false);
    }
  }
*/
