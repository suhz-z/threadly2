// Post card component - displays individual posts with comments
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

// Props for the post card component
interface PostCardProps {
  post: Post; // The post data to display
}

// Main post card component
export function PostCard({ post }: PostCardProps) {
  // State for managing comments and replies
  const [replyContents, setReplyContents] = useState<Record<string, string>>(
    {}
  );
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>(
    {}
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [collapsedComments, setCollapsedComments] = useState<
    Record<string, boolean>
  >({});
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current user session and router for navigation
  const { data: session } = useSession();
  const router = useRouter();

  // Helper functions for managing nested comments
  // Add a new reply to the correct parent comment
  const insertReply = (
    list: Comment[],
    parentId: string,
    newComment: Comment
  ): Comment[] =>
    list.map((c) =>
      c.id === parentId
        ? { ...c, replies: [...(c.replies || []), newComment] }
        : { ...c, replies: insertReply(c.replies || [], parentId, newComment) }
    );

  // Remove a comment from the list (including nested ones)
  const deleteCommentFromList = (list: Comment[], id: string): Comment[] =>
    list
      .filter((c) => c.id !== id)
      .map((c) => ({
        ...c,
        replies: deleteCommentFromList(c.replies || [], id),
      }));

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setComments((prev) => deleteCommentFromList(prev, commentId));
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle functions for UI interactions
  const toggleReplyInput = (id: string) =>
    setShowReplyInput((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleChange = (id: string, value: string) =>
    setReplyContents((prev) => ({ ...prev, [id]: value }));

  const toggleCommentCollapse = (id: string) =>
    setCollapsedComments((prev) => ({ ...prev, [id]: !prev[id] }));

  // Load comments when user clicks to view them
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

  // Submit a new comment or reply
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

      // Add comment to the list (either as top-level or nested reply)
      if (parentId)
        setComments((prev) => insertReply(prev, parentId, newComment));
      else setComments((prev) => [newComment, ...prev]);

      // Clear the input and hide the reply form
      setReplyContents((prev) => ({ ...prev, [parentId || "root"]: "" }));
      setShowReplyInput((prev) => ({ ...prev, [parentId || "root"]: false }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the post card
  return (
    <div className="w-full flex justify-center">
      <div className="max-w-200 w-full border-b border-neutral-200 dark:border-neutral-700 p-4 bg-white dark:bg-transparent">
        {/* Post header with author name and timestamp */}
        <div className="mb-3 flex justify-between items-center">
          <p className="font-semibold">{post.author?.name || "Unknown"}</p>
          <span className="text-xs text-neutral-500">
            {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* Post content - clickable to go to post detail page */}
        <p
          className="cursor-pointer text-neutral-800 text-2xl dark:text-neutral-300 mt-1"
          onClick={() => router.push(`/posts/${post.id}`)}
        >
          {post.content}
        </p>

        {/* Comment input field for top-level comments */}
        <div className="flex gap-2 mt-3 mb-3">
          <Input
            placeholder="Write a comment..."
            value={replyContents["root"] || ""}
            onChange={(e) => handleChange("root", e.target.value)}
            className="flex-1 text-sm"
          />
          <Button
            size="sm"
            disabled={isSubmitting}
            onClick={() => submitComment()}
          >
            {isSubmitting ? "..." : "Send"}
          </Button>
        </div>

        {/* Comments section header with toggle button */}
        <div className="flex items-center gap-2 mb-2 text-sm text-neutral-500">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
            onClick={toggleCommentsVisibility}
            disabled={loadingComments}
          >
            {loadingComments ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <MessageSquare size={14} />
            )}
          </Button>
          {post.commentCount ?? comments.length} Comments
        </div>

        {/* Comments list - only show when expanded */}
        {commentsVisible && (
          <div className="mt-2">
            {loadingComments ? (
              // Show skeleton loading while fetching comments
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-3/4" />
                ))}
              </div>
            ) : comments.length > 0 ? (
              // Render comment thread with all nested comments
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
              // Show message when no comments exist
              <p className="text-sm text-neutral-500">No comments yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
