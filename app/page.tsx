"use client";

import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLoginOrFeed = () => {
    if (session) {
      router.push("/feed");
    } else {
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login"); 
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-gray-100 transition-colors">
        <Loader2 className="w-10 h-10 animate-spin text-gray-700 dark:text-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-gray-100 relative transition-colors gap-6">
      <ThemeToggle />
      <h1 className="text-4xl font-bold">Welcome to Threadly</h1>

      <div className="flex gap-4">
        <Button onClick={handleLoginOrFeed} size="lg">
          {session ? "Go to Feed" : "Login"}
        </Button>

        {session && (
          <Button
            variant="outline"
            onClick={handleLogout}
            size="lg"
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
