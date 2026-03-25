"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";

export function UserProfileHeader() {
  const { user, isGuest } = useAuth();

  const name = user?.username || (isGuest ? "Guest User" : "Loading...");
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-full pl-2 pr-4 py-1 hover:bg-white/[0.04] transition-colors cursor-pointer relative group">
      {/* Circle Profile Photo */}
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold shadow-[0_0_15px_rgba(112,130,56,0.3)] border border-primary/20">
        {initial}
      </div>
      
      {/* Username */}
      <div className="flex flex-col">
        <span className="text-xs font-bold text-foreground leading-none">{name}</span>
        {isGuest ? (
          <span className="text-[9px] text-amber-500 font-bold tracking-widest uppercase mt-0.5">Trial Mode</span>
        ) : (
          <span className="text-[9px] text-primary font-bold tracking-widest uppercase mt-0.5">Premium Tier</span>
        )}
      </div>
    </div>
  );
}
