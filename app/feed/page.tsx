"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/feed/postcard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/types";
import { Card } from "@/components/ui/card";
import { Home, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";


export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

   if (!session) {
    redirect("/login"); // server-side redirect
  }

  //  Fetch posts
  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data: Post[] = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  //  Submit new post
  const submitPost = async () => {
    if (!newPost) return;

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newPost }),
    });

    const data: Post = await res.json();
    setPosts([data, ...posts]);
    setNewPost("");
  };

  //
  const handleLoginOrFeed = () => {
    if (session) router.push("/");
    else router.push("/login");
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-20">
        {/* Home Button */}
        <Button
          variant="ghost"
          className="mb-6 mt-2"
          onClick={handleLoginOrFeed}
        >
          <Home className="w-6 h-6" />
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {/* Logout */}
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

      {/* Feed */}
      <main className="flex flex-col items-center flex-1 py-8 min-h-screen">
        <Card className="w-full max-w-2xl p-6 shadow-sm dark:shadow-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 transition-shadow hover:shadow-md">
          {/* New Post Form */}
          <div className="flex w-full justify-center mb-6">
            <div className="flex w-full max-w-md gap-2 items-center">
               {session?.user?.name} { ':'}
              <Input
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="flex-1"
              />
              <Button onClick={submitPost}>Post</Button>
              
            </div>
            
          </div>

          {/* Posts Feed */}
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
