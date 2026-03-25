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

const PUBLIC_PATHS = ["/auth"];

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
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
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
    if (!user && !isPublic) {
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
