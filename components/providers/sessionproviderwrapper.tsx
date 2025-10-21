//  Session provider wrapper component
// Provides NextAuth session context to the entire application

"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

// Wrapper component that provides authentication session context to all child components
export function SessionProviderWrapper({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
