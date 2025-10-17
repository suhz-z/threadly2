"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";

export function GuestSidebar({
  collapsed,
  setCollapsed,
}: {
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
        <SidebarGroup title={!collapsed ? "Welcome" : undefined}>
          {!collapsed ? (
            <>
              <p className="px-4 text-sm text-gray-500 mb-2">
                Please login or signup to start conversations.
              </p>
              <div className="flex flex-col gap-2 px-4">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
                <Link href="/signup" className="text-blue-600 hover:underline">
                  Sign Up
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 px-2 mt-4">
              <Link href="/login" title="Login">
                🔑
              </Link>
              <Link href="/signup" title="Sign Up">
                ✍️
              </Link>
            </div>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
