"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Loader2 } from "lucide-react";
import { Post, Comment } from "@/types/types";
import { useSession } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/time";
import CommentThread from "@/components/comments/comment-thread";

 

interface PostCardProps {
  post: Post;
  
}

export function PostCard({ post }: PostCardProps) {
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [collapsedComments, setCollapsedComments] = useState<Record<string, boolean>>({});
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Recursive helpers
  const insertReply = (list: Comment[], parentId: string, newComment: Comment): Comment[] =>
    list.map((c) =>
      c.id === parentId
        ? { ...c, replies: [...(c.replies || []), newComment] }
        : { ...c, replies: insertReply(c.replies || [], parentId, newComment) }
    );

  const deleteCommentFromList = (list: Comment[], id: string): Comment[] =>
    list
      .filter((c) => c.id !== id)
      .map((c) => ({ ...c, replies: deleteCommentFromList(c.replies || [], id) }));

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setComments((prev) => deleteCommentFromList(prev, commentId));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReplyInput = (id: string) =>
    setShowReplyInput((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleChange = (id: string, value: string) =>
    setReplyContents((prev) => ({ ...prev, [id]: value }));

  const toggleCommentCollapse = (id: string) =>
    setCollapsedComments((prev) => ({ ...prev, [id]: !prev[id] }));

  // Lazy-load comments when toggled open
  const toggleCommentsVisibility = async () => {
    if (!commentsVisible) {
      setLoadingComments(true);
      try {
        const res = await fetch(`/api/posts/${post.id}/comments`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data: Comment[] = await res.json();
        setComments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
    setCommentsVisible((prev) => !prev);
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

      if (!res.ok) throw new Error("Failed to post comment");
      const newComment: Comment = await res.json();

      if (parentId) setComments((prev) => insertReply(prev, parentId, newComment));
      else setComments((prev) => [newComment, ...prev]);

      setReplyContents((prev) => ({ ...prev, [parentId || "root"]: "" }));
      setShowReplyInput((prev) => ({ ...prev, [parentId || "root"]: false }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

 

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-200 w-full border-b border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-transparent">
        {/* Post header */}
        <div className="mb-3 flex justify-between items-center">
          <p className="font-semibold">{post.author?.name || "Unknown"}</p>
          <span className="text-xs text-neutral-500">{timeAgo(post.createdAt)}</span>
        </div>

        <p
          className="cursor-pointer text-neutral-800 text-2xl dark:text-neutral-300 mt-1"
          onClick={() => router.push(`/posts/${post.id}`)}
        >
          {post.content}
        </p>

        {/* Top-level comment input */}
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

        {/* Comments header */}
        <div className="flex items-center gap-2 mb-2 text-sm text-neutral-500">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
            onClick={toggleCommentsVisibility}
            disabled={loadingComments}
          >
            {loadingComments ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
          </Button>
          {post.commentCount ?? comments.length} Comments
        </div>

        {/* Comments */}
        {commentsVisible && (
          <div className="mt-2">
            {loadingComments ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-3/4" />
                ))}
              </div>
            ) : comments.length > 0 ? (
              <CommentThread
                comments={comments}
                collapsedComments={collapsedComments}
                showReplyInput={showReplyInput}
                replyContents={replyContents}
                isSubmitting={isSubmitting}
                currentUserName={session?.user?.name ?? null}
                onToggleCollapse={toggleCommentCollapse}
                onToggleReplyInput={toggleReplyInput}
                onChangeReply={handleChange}
                onSubmitReply={submitComment}
                onDeleteComment={handleDeleteComment}
              />
            ) : (
              <p className="text-sm text-neutral-500">No comments yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
