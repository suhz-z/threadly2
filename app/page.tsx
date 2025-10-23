// Home page component for Threadly
// Displays welcome message, theme toggle, and navigation based on authentication status

"use client";

import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

// Main component for the home page
export default function HomePage() {
  // Get current session and loading status from NextAuth
  const { data: session, status } = useSession();
  const router = useRouter();

  // Navigate to feed if logged in, otherwise to login page
  const handleLoginOrFeed = () => {
    if (session) {
      router.push("/feed");
    } else {
      router.push("/login");
    }
  };

  // Handle user logout and redirect to login
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Show loading spinner while checking authentication status
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-gray-100 transition-colors">
        <Loader2 className="w-10 h-10 animate-spin text-gray-700 dark:text-gray-200" />
      </div>
    );
  }

  // Main UI with welcome message and navigation buttons
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-gray-100 relative transition-colors gap-6">
      {/* Theme toggle button positioned in top-right */}
      <ThemeToggle />
      <h1 className="text-4xl font-bold">Welcome to Threadly</h1>

      <div className="flex gap-4">
        {/* Button text changes based on authentication status */}
        <Button onClick={handleLoginOrFeed} size="lg" className="cursor-pointer">
          {session ? "Go to Feed" : "Login"}
        </Button>

        {/* Show logout button only if user is authenticated */}
        {session && (
          <Button
            variant="outline"
            onClick={handleLogout}
            size="lg"
            className="cursor-pointer flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
