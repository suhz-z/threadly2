"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

export function Feed() {
  // Dummy data for demonstration
  const posts = [
    { id: 1, author: "Alice", content: "Hello world!" },
    { id: 2, author: "Bob", content: "My first post!" },
  ];

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardTitle>{post.author}</CardTitle>
          <CardContent>{post.content}</CardContent>
        </Card>
      ))}
    </div>
  );
}
