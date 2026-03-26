"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Wallet, BrainCircuit, ListVideo, ListTodo, HelpCircle, LogOut, UserCircle, Target, Sparkles, User, Settings } from "lucide-react";
import { WealthDistribution } from "./wealth-distribution";


const SidebarItem = ({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) => (
  <Link href={href}>
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group",
      active ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-white/5"
    )}>
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
      <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
        {label}
      </span>
    </div>
  </Link>
);

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-8 pb-12">
        <Link href="/welcome" className="flex flex-col group cursor-pointer">
          <span className="font-bold text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">AVKAST</span>
          <span className="text-[10px] text-muted-foreground tracking-[0.2em] font-bold uppercase mt-1 group-hover:text-primary/70 transition-colors">
            INTELLIGENCE
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <SidebarItem icon={LayoutDashboard} label="DASHBOARD" href="/" active={pathname === "/"} />
        <SidebarItem icon={Wallet} label="PORTFOLIO" href="/portfolio" active={pathname === "/portfolio"} />
        <SidebarItem icon={BrainCircuit} label="AI ADVISOR" href="/advisor" active={pathname === "/advisor"} />
        <SidebarItem icon={ListTodo} label="TASKS" href="/tasks" active={pathname === "/tasks"} />
        <SidebarItem icon={ListVideo} label="WATCHLIST" href="/watchlist" active={pathname === "/watchlist"} />
        <SidebarItem icon={Target} label="GOALS" href="/goals" active={pathname === "/goals"} />
        <SidebarItem icon={Sparkles} label="SANDBOX" href="/sandbox" active={pathname === "/sandbox"} />
        <div className="h-px bg-white/5 mx-2 my-1" />
        <SidebarItem icon={User} label="PROFILE" href="/profile" active={pathname === "/profile"} />
        <SidebarItem icon={Settings} label="SETTINGS" href="/settings" active={pathname === "/settings"} />
        <SidebarItem icon={HelpCircle} label="SUPPORT" href="/support" active={pathname === "/support"} />
      </nav>

      <div className="mt-auto">
        <div className="p-4 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Neural Link Active</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-medium">
              Alpha Generation Swarm is currently auditing 4,281 global liquidity nodes.
            </p>
            <Link href="/sandbox" className="flex w-full">
              <button className="w-full py-2.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-[0_0_15px_rgba(112,130,56,0.3)]">
                + NEW SIMULATION
              </button>
            </Link>
          </div>
        </div>
        
        <div className="p-2 space-y-1">
          <WealthDistribution className="mx-2 mb-2" />
          <div onClick={signOut} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group hover:bg-destructive/10">
            <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-destructive text-[11px] font-bold tracking-widest">
              SIGN OUT
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
