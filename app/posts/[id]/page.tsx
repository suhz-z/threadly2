"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Post } from "@/types/types";
import { PostCard } from "@/components/feed/postcard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ThreadPage() {
  const { id } = useParams(); // /posts/[id]
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch a single post and its comments
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${id}`);

        if (!res.ok) {
          const message = `Failed to fetch post: ${res.status}`;
          console.error(message);
          setError(message);
          setLoading(false);
          return;
        }

        const data: Post = await res.json();
        setPost(data);
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Something went wrong while loading this thread.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // --- Conditional rendering for states ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <div className="w-full max-w-2xl p-6 space-y-6">
          {/* Back button skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Post skeleton */}
          <div className="space-y-4 mt-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <p className="text-red-500 mb-4">{error || "Post not found."}</p>
        <Button variant="outline" onClick={() => router.push("/feed")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </Button>
      </div>
    );
  }

  // --- Main render ---
  return (
    <div className="flex flex-col items-center min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <div className="mb-4">
          <Button variant="ghost" onClick={() => router.push("/feed")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
          </Button>
        </div>
        <main className="flex flex-col items-center flex-1 py-8 min-h-screen">
        <Card className="w-full max-w-2xl p-6 shadow-sm dark:shadow-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 transition-shadow hover:shadow-md">

        {/* Post + Comments */}
        <PostCard post={post} />
        </Card>
        </main>
      </div>
    </div>
  );
}
