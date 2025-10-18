"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Post, Comment } from "@/types/types";
import { useSession } from "next-auth/react";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [collapsedComments, setCollapsedComments] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const toggleCollapse = (id: string) => {
    setCollapsedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (id: string, value: string) => {
    setReplyContents((prev) => ({ ...prev, [id]: value }));
  };

  const submitComment = async (parentId?: string) => {
  const content = replyContents[parentId || "root"];
  if (!content) return;
  if (!session?.user?.email) {
    console.error("You must be logged in to comment");
    return;
  }

  setIsSubmitting(true);
  try {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        postId: post.id,
        parentId: parentId || null,
        userEmail: session.user.email, // ✅ include this
      }),
    });

    if (!res.ok) {
      console.error("Failed to submit comment", res.status);
      return;
    }

    const data: Comment = await res.json();

    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), data] }
            : c
        )
      );
    } else {
      setComments((prev) => [data, ...prev]);
    }

    setReplyContents((prev) => ({ ...prev, [parentId || "root"]: "" }));
  } catch (err) {
    console.error("Error submitting comment:", err);
  } finally {
    setIsSubmitting(false);
  }
};

  const renderReplies = (replies: Comment[]) =>
    replies.map((c) => (
      <div key={c.id} className="ml-6 mt-2 border-l pl-2">
        <div className="flex items-center justify-between">
          <p>
            <strong>{c.author?.name || "Unknown"}:</strong> {c.content}
          </p>
          {c.replies && c.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0"
              onClick={() => toggleCollapse(c.id)}
            >
              {collapsedComments[c.id] ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </Button>
          )}
        </div>

        {/* Inline reply form */}
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Reply..."
            value={replyContents[c.id] || ""}
            onChange={(e) => handleChange(c.id, e.target.value)}
            className="flex-1"
          />
          <Button
            size="sm"
            disabled={isSubmitting}
            onClick={() => submitComment(c.id)}
          >
            {isSubmitting ? "..." : "Reply"}
          </Button>
        </div>

        {!collapsedComments[c.id] && c.replies && renderReplies(c.replies)}
      </div>
    ));

  return (
    <div className="border rounded-md p-4 mb-4 bg-white dark:bg-neutral-800">
      <p className="mb-2">
        <strong>{post.author?.name || "Unknown"}</strong> - {post.content}
      </p>

      {/* Top-level reply form */}
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Reply..."
          value={replyContents["root"] || ""}
          onChange={(e) => handleChange("root", e.target.value)}
          className="flex-1"
        />
        <Button size="sm" disabled={isSubmitting} onClick={() => submitComment()}>
          {isSubmitting ? "..." : "Reply"}
        </Button>
      </div>

      {/* Comments */}
      <div>{renderReplies(comments)}</div>
    </div>
  );
}
