"use client"
import { useSession } from "next-auth/react";
import { Feed } from "@/components/feed/feed";
import { WelcomeMessage } from "@/components/welcome/welcome";

export default function HomePage() {
  const { data: session } = useSession();

  return <>{session ? <Feed /> : <WelcomeMessage />}</>;
}
