"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authAPI, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  register: (nom: string, email: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, motDePasse: string) => {
    const response = await authAPI.login({ email, motDePasse });
    const { access, refresh, user: userData } = response.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setUser(userData);

    if (userData.role === "ADMINISTRATEUR") {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
  };

  const register = async (nom: string, email: string, motDePasse: string) => {
    await authAPI.register({ nom, email, motDePasse });
    router.push("/connexion");
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await authAPI.logout(refreshToken);
      } catch {
        // Continue with logout even if API call fails
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMINISTRATEUR",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
