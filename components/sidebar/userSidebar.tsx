"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Menu, LogOut, Home, MessageSquare, Settings } from "lucide-react";
import { Button } from "../ui/button";

export function UserSidebar({
  name,
  collapsed,
  setCollapsed,
}: {
  name: string;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  return (
    <Sidebar
      className={`transition-all duration-300 border-r bg-white ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <SidebarHeader className="flex items-center justify-between px-4 py-3 border-b">
        {!collapsed && <span className="text-xl font-bold">Threadly</span>}
        <SidebarTrigger asChild>
          <Button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <Menu size={20} />
          </Button>
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarContent className="mt-4">
        <SidebarGroup title={!collapsed ? `Hello, ${name}` : undefined}>
          <nav className="flex flex-col gap-2 mt-2 px-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md"
            >
              <Home size={18} />
              {!collapsed && <span>Feed</span>}
            </Link>

            <Link
              href="/threads"
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md"
            >
              <MessageSquare size={18} />
              {!collapsed && <span>My Threads</span>}
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md"
            >
              <Settings size={18} />
              {!collapsed && <span>Settings</span>}
            </Link>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md text-red-500"
            >
              <LogOut size={18} />
              {!collapsed && <span>Logout</span>}
            </button>
          </nav>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
