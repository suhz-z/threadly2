"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Reply } from "lucide-react";
import { Post, Comment } from "@/types/types";
import { useSession } from "next-auth/react";

function timeAgo(timestamp: string | Date) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return time.toLocaleDateString();
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const insertReply = (list: Comment[], parentId: string, newComment: Comment): Comment[] =>
    list.map((c) => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), newComment] };
      }
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: insertReply(c.replies, parentId, newComment) };
      }
      return c;
    });

  const toggleReplyInput = (id: string) => {
    setShowReplyInput((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (id: string, value: string) => {
    setReplyContents((prev) => ({ ...prev, [id]: value }));
  };

  const submitComment = async (parentId?: string) => {
    const content = replyContents[parentId || "root"];
    if (!content || !session?.user?.email) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          postId: post.id,
          parentId: parentId || null,
          userEmail: session.user.email,
        }),
      });

      if (!res.ok) return;

      const data: Comment = await res.json();
      if (parentId) setComments((prev) => insertReply(prev, parentId, data));
      else setComments((prev) => [data, ...prev]);

      setReplyContents((prev) => ({ ...prev, [parentId || "root"]: "" }));
      setShowReplyInput((prev) => ({ ...prev, [parentId || "root"]: false }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCommentsVisibility = () => {
    setCommentsVisible((prev) => !prev);
  };

  const renderReplies = (replies: Comment[]) =>
    replies.map((c) => (
      <div key={c.id} className="ml-6 mt-3 border-l border-neutral-200 dark:border-neutral-700 pl-3">
        <div className="flex items-start justify-between text-sm">
          <div>
            <p className="flex items-center gap-2">
              <strong>{c.author?.name || "Unknown"}</strong>
              <span className="text-xs text-neutral-500">{timeAgo(c.createdAt)}</span>
            </p>
            <p className="text-sm text-neutral-800 dark:text-neutral-300 mt-1">{c.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
          <button
            onClick={() => toggleReplyInput(c.id)}
            className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-white"
          >
            <Reply size={12} /> Reply
          </button>
        </div>

        {showReplyInput[c.id] && (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Write a reply..."
              value={replyContents[c.id] || ""}
              onChange={(e) => handleChange(c.id, e.target.value)}
              className="flex-1 text-sm"
            />
            <Button size="sm" disabled={isSubmitting} onClick={() => submitComment(c.id)}>
              {isSubmitting ? "..." : "Send"}
            </Button>
          </div>
        )}

        {c.replies && c.replies.length > 0 && renderReplies(c.replies)}
      </div>
    ));

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-200 w-full border-b border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-transparent">
        {/* Post Header */}
        <div className="mb-3 flex justify-between items-center">
          <div>
            <p className="font-semibold">{post.author?.name || "Unknown"}</p>
            <span className="text-xs text-neutral-500">{timeAgo(post.createdAt)}</span>
          </div>
        </div>

        <p className="text-neutral-800 dark:text-neutral-300 mt-1">{post.content}</p>

        {/* Comment Input */}
        <div className="flex gap-2 mt-3 mb-3">
          <Input
            placeholder="Write a comment..."
            value={replyContents["root"] || ""}
            onChange={(e) => handleChange("root", e.target.value)}
            className="flex-1 text-sm"
          />
          <Button size="sm" disabled={isSubmitting} onClick={() => submitComment()}>
            {isSubmitting ? "..." : "Send"}
          </Button>
        </div>

        {/* Comments Header */}
        <div className="flex items-center gap-2 mb-2 text-sm text-neutral-500">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
            onClick={toggleCommentsVisibility}
          >
            <MessageSquare size={14} />
          </Button>
          {comments.length} Comments
        </div>

        {/* Comments Section (toggle visibility) */}
        {commentsVisible && comments.length > 0 && (
          <div className="mt-2">{renderReplies(comments)}</div>
        )}
      </div>
    </div>
  );
}
