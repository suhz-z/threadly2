//  Theme provider wrapper component
// Provides theme context (light/dark/system) to the entire application using next-themes

"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

// Wrapper component that provides theme context to all child components
export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class" // Apply theme via CSS class on html element
      defaultTheme="system" // Default to system preference
      enableSystem // Allow system theme detection
      disableTransitionOnChange // Disable transitions during theme changes
    >
      {children}
    </ThemeProvider>
  );
}
