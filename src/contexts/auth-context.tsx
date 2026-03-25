"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
  isGuest?: boolean;
  initialWealth?: number;
  preferredMarkets?: string;
}

interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isGuest: false,
  isLoading: true,
  signOut: async () => {},
  refresh: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const PUBLIC_PATHS = ["/auth", "/welcome"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        console.log("[AuthContext] fetchUser success:", data.user);
        setUser(data.user);
      } else {
        console.warn("[AuthContext] fetchUser failed:", res.status);
        setUser(null);
      }
    } catch (err) {
      console.error("[AuthContext] fetchUser error:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
    console.log("[AuthContext] Navigation guard check:", { pathname, user: user?.id, isPublic });
    if (!user && !isPublic) {
      console.log("[AuthContext] Redirecting to /auth");
      router.replace("/auth");
    }
  }, [user, isLoading, pathname, router]);

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
    router.replace("/auth");
  };

  const isGuest = user?.isGuest === true;

  return (
    <AuthContext.Provider value={{ user, isGuest, isLoading, signOut, refresh: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
