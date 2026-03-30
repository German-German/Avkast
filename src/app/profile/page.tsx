"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { useAuth } from "@/contexts/auth-context";
import { UserCircle, ShieldCheck, Mail, KeyRound, Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isGuest, signOut } = useAuth();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Server error: unexpected response. Please try again.");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed");

      setSuccess(true);
      // Wait a moment then reload to get full user status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          leftContent={
            <div className="flex items-center gap-3">
              <UserCircle className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold tracking-tight text-foreground">AVKAST ACCOUNT</h1>
            </div>
          }
          rightContent={null}
        />

        <div className="flex-1 p-8 flex justify-center items-start overflow-y-auto">
          <div className="w-full max-w-2xl space-y-6">
            
            {/* User Info Card */}
            <div className="p-8 rounded-2xl glass border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                <ShieldCheck className="w-32 h-32 text-primary" />
              </div>

              <div className="relative z-10 flex items-start gap-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-4xl text-primary-foreground font-bold shadow-[0_0_30px_rgba(112,130,56,0.5)] border-4 border-background">
                  {user?.username?.[0]?.toUpperCase() || (isGuest ? "G" : "?")}
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">
                      {isGuest ? "Guest User" : user?.username}
                    </h2>
                    <p className="text-sm text-muted-foreground font-mono mt-1">
                      {isGuest ? "Temporary Session" : user?.email}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border",
                      isGuest 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                        : "bg-primary/10 border-primary/30 text-primary"
                    )}>
                      {isGuest ? "Trial Tier" : "Premium Tier"}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                      ID: {user?.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Upgrade Form */}
            {isGuest ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Upgrade Your Account</h3>
                  <p className="text-sm text-muted-foreground">
                    You are currently using a temporary guest session. Create a permanent account to safely store your watchlist, AI memory, and portfolio data.
                  </p>
                </div>

                <form onSubmit={handleUpgrade} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Account upgraded successfully. Reloading...
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Choose Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-white"
                        disabled={loading || success}
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-white"
                        disabled={loading || success}
                      />
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="Create Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-white"
                        disabled={loading || success}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full h-12 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Secure Permanent Account"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Device Trust</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your session is secure and active on this device.</p>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-5 py-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase rounded-lg hover:bg-destructive/20 transition-all"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
