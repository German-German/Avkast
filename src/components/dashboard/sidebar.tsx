import React from "react";
import { cn } from "@/lib/utils";

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={cn(
    "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 group",
    active ? "bg-primary/10 border-r-2 border-primary" : "hover:bg-white/5"
  )}>
    <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
    <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
      {label}
    </span>
  </div>
);

import { LayoutDashboard, Wallet, BrainCircuit, ListVideo, ListTodo, HelpCircle, LogOut } from "lucide-react";

export const Sidebar: React.FC = () => {
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
        <SidebarItem icon={LayoutDashboard} label="DASHBOARD" active />
        <SidebarItem icon={Wallet} label="PORTFOLIO" />
        <SidebarItem icon={BrainCircuit} label="AI ADVISOR" />
        <SidebarItem icon={ListTodo} label="TASKS" />
        <SidebarItem icon={ListVideo} label="WATCHLIST" />
      </nav>

      <div className="p-4 space-y-4">
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
          <button className="w-full py-2 px-4 bg-accent text-accent-foreground rounded-md text-xs font-bold uppercase tracking-tight hover:opacity-90 transition-opacity">
            + NEW SIMULATION
          </button>
        </div>
        
        <div className="space-y-1">
          <SidebarItem icon={HelpCircle} label="SUPPORT" />
          <SidebarItem icon={LogOut} label="SIGN OUT" />
        </div>
      </div>
    </aside>
  );
};
