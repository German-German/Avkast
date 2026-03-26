import React from "react";
import Link from "next/link";
import { GlobalSearch } from "./global-search";
import { UserProfileHeader } from "./user-profile-header";
import { Bell, Settings, TrendingUp, TrendingDown, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Topbar({ 
  leftContent, 
  title,
  rightContent
}: { 
  leftContent?: React.ReactNode, 
  title?: string,
  rightContent?: React.ReactNode
}) {
  const [showNotifications, setShowNotifications] = React.useState(false);

  const notifications = [
    { id: 1, type: "MARKET", title: "S&P 500 Surging", body: "Index up 2.4% following rate decision. Institutional liquidity increasing.", icon: TrendingUp, color: "text-accent" },
    { id: 2, type: "CRYPTO", title: "Bitcoin Volatility", body: "BTC testing $72k resistance levels. Neural swarm signals 'Hold'.", icon: Zap, color: "text-primary" },
    { id: 3, type: "PORTFOLIO", title: "Wealth Milestone", body: "Your portfolio has breached the $1.5M mark. strategy optimization recommended.", icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        {leftContent}
        {title && <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">{title}</h1>}
      </div>

      <div className="flex items-center gap-6">
        {rightContent}
        <GlobalSearch />
        
        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-xl transition-all",
              showNotifications ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-muted-foreground"
            )}
          >
            <Bell className="h-4 w-4" />
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Intelligence Feed</span>
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">3 NEW</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <div className="flex gap-3">
                      <div className={cn("mt-1", n.color)}>
                        <n.icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-foreground flex items-center justify-between">
                          {n.title}
                          <span className="text-[9px] text-muted-foreground font-normal">2m ago</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                          {n.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white/[0.01] text-center border-t border-white/5">
                <button className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                  View All Activity
                </button>
              </div>
            </div>
          )}

          <Link href="/settings" className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-muted-foreground transition-all">
            <Settings className="h-4 w-4" />
          </Link>
        </div>

        <div className="h-6 w-px bg-white/10" />
        
        <UserProfileHeader />
      </div>
    </header>
  );
}
