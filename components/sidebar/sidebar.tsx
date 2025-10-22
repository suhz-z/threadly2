"use client";

import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";

interface SidebarProps {
  onHomeClick: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  showLogout: boolean;
  onLogout?: () => void;
}

export function Sidebar({
  onHomeClick,
  onToggleTheme,
  isDark,
  showLogout,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-20">
      <Button variant="ghost" className="mb-6 mt-2" onClick={onHomeClick}>
        <Home className="w-6 h-6" />
      </Button>

      <div className="flex-1" />

      <Button variant="outline" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
        {isDark ? (
          // sun icon (inline to avoid importing again from parent)
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        ) : (
          // moon icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </Button>

      {showLogout && (
        <Button
          variant="ghost"
          className="mt-4 text-red-500 hover:text-red-600"
          onClick={onLogout}
          aria-label="Logout"
        >
          <LogOut className="w-6 h-6" />
        </Button>
      )}
    </aside>
  );
}

export default Sidebar;


