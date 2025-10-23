"use client";

import { Button } from "@/components/ui/button";
import { Home, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  onHomeClick: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  onLogout?: () => Promise<void> | void;
}
 

export function Sidebar({onHomeClick, onToggleTheme, isDark, onLogout,}: SidebarProps) {
  const [isLoading, setIsLoading] = useState(false);

   const handleLogout = async () => {
    if (!onLogout) return;
    try {
      setIsLoading(true);
      await Promise.resolve(onLogout());
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-20">
      <Button variant="ghost" className="mb-6 mt-2" onClick={onHomeClick}>
        <Home className="w-6 h-6" />
      </Button>

      <div className="flex-1" />

      <Button
        variant="outline"
        size="icon"
        onClick={onToggleTheme}
        aria-label="Toggle theme"
      >
        {isDark ? (
          // sun icon
          <Sun className="w-5 h-5" />
        ) : (
          // moon icon
          <Moon className="w-5 h-5" />
        )}
      </Button>

    
        <Button
          variant="ghost"
          className="mt-4 text-red-500 hover:text-red-600"
          onClick={handleLogout}
          aria-label="Logout"
          disabled={isLoading}
        >
          <LogOut className="w-6 h-6" />
        </Button>
      
    </aside>
  );
}

export default Sidebar;
