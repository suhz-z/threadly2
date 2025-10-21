"use client"
import { LoginForm } from "@/components/login-form"
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/feed");
    }
  }, [status, router]);

  if (status === "loading" || session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-gray-100 transition-colors">
        <Loader2 className="w-10 h-10 animate-spin text-gray-700 dark:text-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 dark:bg-neutral-900 text-neutral-900">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
