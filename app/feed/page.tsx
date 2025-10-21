// Main feed page displaying posts and allowing new post creation
// Features sidebar navigation, theme toggle, and real-time post/comment updates

"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/feed/postcard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/types";
import { Card } from "@/components/ui/card";
import { Home, Loader2, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";


export default function FeedPage() {
  // State for managing posts and new post input
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const { data: session ,status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Redirect to login if not authenticated (server-side)
  if (!session) {
    redirect("/login");
  }

  // Function to fetch all posts from the API
  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data: Post[] = await res.json();
    setPosts(data);
  };

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Prevent hydration mismatch for theme
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Handle submitting a new post
  const submitPost = async () => {
    if (!newPost) return;

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost }),
    });

    const data: Post = await res.json();
    setPosts([data, ...posts]); // Add new post to the top
    setNewPost("");
  };

  // Navigate to home page
  const handleLoginOrFeed = () => {
    if (session) router.push("/");
    else router.push("/login");
  };

  // Handle user logout
  const handleLogout = async () => {
    await signOut({ redirect: true })
    redirect('/login');
  };



  // Main layout with sidebar and feed content
  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Fixed sidebar with navigation and controls */}
      <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-20">
        {/* Home Button - navigates to main page */}
        <Button
          variant="ghost"
          className="mb-6 mt-2"
          onClick={handleLoginOrFeed}
        >
          <Home className="w-6 h-6" />
        </Button>

        {/* Spacer to push theme toggle and logout to bottom */}
        <div className="flex-1" />

        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {/* Logout button - only shown if user is logged in */}
        {session && (
        <Button
          variant="ghost"
          className="mt-4 text-red-500 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-6 h-6" />
        </Button>
        )}
      </aside>

      {/* Main feed content area */}
      <main className="flex flex-col items-center flex-1 py-8 min-h-screen">
        <Card className="w-full max-w-2xl p-6 shadow-sm dark:shadow-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 transition-shadow hover:shadow-md">
          {/* New Post Form - allows users to create posts */}
          <div className="flex w-full justify-center mb-6">
            <div className="flex w-full max-w-md gap-2 items-center">
                {session?.user?.name && <span>{session.user.name}:</span>}
              <Input
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="flex-1"
              />
              <Button onClick={submitPost}>Post</Button>

            </div>

          </div>

          {/* Posts Feed - displays all posts with comments */}
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
