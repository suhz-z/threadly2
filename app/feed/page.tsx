"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/feed/postcard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/types";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");

  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data: Post[] = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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

  return (
    <div className="p-6">
      {/* New post form */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="What's on your mind?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="flex-1"
        />
        <Button onClick={submitPost}>Post</Button>
      </div>

      {/* Feed */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
