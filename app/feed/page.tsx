
// This is the main page users see after logging in
// Features: Create posts, view all posts, comment system, sidebar navigation

"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/feed/postcard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/types";
import { Card } from "@/components/ui/card";
 
import { Sidebar } from "@/components/sidebar/sidebar";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
 
import { Skeleton } from "@/components/ui/skeleton"; 

export default function FeedPage() {
  
  // state management
  const [posts, setPosts] = useState<Post[]>([]);       
  const [newPost, setNewPost] = useState("");         
  const [loading, setLoading] = useState(false);        
  const [mounted, setMounted] = useState(false);         // Prevent hydration issues
  
 
  // authentication and navigation
 
  const { data: session, status } = useSession();       // Get current user info
  const router = useRouter();                         
  const { theme, setTheme } = useTheme();               
  
 
  // If user is not logged in, redirect them to login page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Function to fetch all posts from the API
  const fetchPosts = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/posts");
    const data: Post[] = await res.json();
    setPosts(data);
  } catch (err) {
    console.error("Failed to load posts:", err);
  } finally {
    setLoading(false);
  }
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
    await signOut({ redirect: false });
    router.replace('/login');
  };

//   if (loading) {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-neutral-900 dark:text-gray-100 transition-colors">
//         <Loader2 className="w-10 h-10 animate-spin text-gray-700 dark:text-gray-200" />
//       </div>
//   );
// }



  // Main layout with sidebar and feed content
  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Sidebar
        onHomeClick={handleLoginOrFeed}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        isDark={theme === "dark"}
        onLogout={handleLogout}
      />

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
            {loading ? (
              // 🔹 Skeleton loader while posts load
              <div className="space-y-6 p-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />{" "}
                      
                      <Skeleton className="h-4 w-1/3" /> 
                    </div>
                    <Skeleton className="h-6 w-3/4" /> 
                    <Skeleton className="h-4 w-1/2" />
                    
                  </div>
                ))}
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
