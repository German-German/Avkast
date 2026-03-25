import React from "react";
import { GlobalSearch } from "./global-search";
import { UserProfileHeader } from "./user-profile-header";
import { Bell, Settings } from "lucide-react";

export function Topbar({ 
  leftContent, 
  title,
  rightContent
}: { 
  leftContent?: React.ReactNode, 
  title?: string,
  rightContent?: React.ReactNode
}) {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        {leftContent}
        {title && <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">{title}</h1>}
      </div>

      <div className="flex items-center gap-6">
        {rightContent}
        <GlobalSearch />
        
        <div className="flex items-center gap-2">
          <button className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-muted-foreground transition-all">
            <Bell className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-muted-foreground transition-all">
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-white/10" />
        
        <UserProfileHeader />
      </div>
    </header>
  );
}
