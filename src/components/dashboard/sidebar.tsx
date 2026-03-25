"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Wallet, BrainCircuit, ListVideo, ListTodo, HelpCircle, LogOut, UserCircle } from "lucide-react";


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
        <div className="flex flex-col">
          <span className="font-bold text-2xl tracking-tighter text-foreground">AVKAST</span>
          <span className="text-[10px] text-muted-foreground tracking-[0.2em] font-bold uppercase mt-1">
            INTELLIGENCE
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <SidebarItem icon={LayoutDashboard} label="DASHBOARD" href="/" active={pathname === "/"} />
        <SidebarItem icon={Wallet} label="PORTFOLIO" href="/portfolio" active={pathname === "/portfolio"} />
        <SidebarItem icon={BrainCircuit} label="AI ADVISOR" href="/advisor" active={pathname === "/advisor"} />
        <SidebarItem icon={ListTodo} label="TASKS" href="/tasks" active={pathname === "/tasks"} />
        <SidebarItem icon={ListVideo} label="WATCHLIST" href="/watchlist" active={pathname === "/watchlist"} />
        <SidebarItem icon={UserCircle} label="PROFILE" href="/profile" active={pathname === "/profile"} />
      </nav>

      <div className="p-4 space-y-4">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <button className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-md text-xs font-bold uppercase tracking-tight hover:opacity-90 transition-all shadow-sm">
            + NEW SIMULATION
          </button>
        </div>
        
        <div className="space-y-1">
          <SidebarItem icon={HelpCircle} label="SUPPORT" href="/support" active={pathname === "/support"} />
          <div onClick={signOut} className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group hover:bg-destructive/10">
            <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-destructive">
              SIGN OUT
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
