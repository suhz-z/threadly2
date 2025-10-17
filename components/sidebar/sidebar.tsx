"use client";

import { useSession } from "next-auth/react";
import { GuestSidebar } from "./guestsidebar";
import { UserSidebar } from "./userSidebar";

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}) {
  const { data: session } = useSession();

  if (!session)
    return <GuestSidebar collapsed={collapsed} setCollapsed={setCollapsed} />;

  return (
    <UserSidebar
      name={session.user?.name || "User"}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    />
  );
}
