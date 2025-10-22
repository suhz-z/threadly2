"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronLeft, Reply, Trash2 } from "lucide-react";
import { Comment } from "@/types/types";
import { timeAgo } from "@/lib/time";

interface CommentThreadProps {
  comments: Comment[];
  collapsedComments: Record<string, boolean>;
  showReplyInput: Record<string, boolean>;
  replyContents: Record<string, string>;
  isSubmitting: boolean;
  currentUserName?: string | null;
  onToggleCollapse: (id: string) => void;
  onToggleReplyInput: (id: string) => void;
  onChangeReply: (id: string, value: string) => void;
  onSubmitReply: (parentId: string) => void;
  onDeleteComment: (id: string) => void;
}

export function CommentThread({
  comments,
  collapsedComments,
  showReplyInput,
  replyContents,
  isSubmitting,
  currentUserName,
  onToggleCollapse,
  onToggleReplyInput,
  onChangeReply,
  onSubmitReply,
  onDeleteComment,
}: CommentThreadProps) {
  return (
    <>
      {comments.map((c) => {
        const isOwner = c.author?.name === currentUserName;
        return (
          <div
            key={c.id}
            className="ml-6 mt-3 border-l border-neutral-200 dark:border-neutral-700 pl-3"
          >
            <div className="flex items-start justify-between text-sm">
              <div>
                <p className="flex items-center gap-2">
                  <strong>{c.author?.name || "Unknown"}</strong>
                  <span className="text-xs text-neutral-500">{timeAgo(c.createdAt)}</span>
                </p>
                <p className="text-sm text-neutral-800 dark:text-neutral-300 mt-1">{c.content}</p>
              </div>
              <div className="flex items-center gap-2">
                {(c.replies?.length ?? 0) > 0 && (
                  <button
                    onClick={() => onToggleCollapse(c.id)}
                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
                    aria-label={collapsedComments[c.id] ? "Expand replies" : "Collapse replies"}
                  >
                    {collapsedComments[c.id] ? <ChevronLeft size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
                {isOwner && (
                  <Button
                    onClick={() => onDeleteComment(c.id)}
                    className="bg-transparent hover:bg-transparent text-gray-500 hover:text-red-500"
                    aria-label="Delete comment"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
              <button
                onClick={() => onToggleReplyInput(c.id)}
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
                  onChange={(e) => onChangeReply(c.id, e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button size="sm" disabled={isSubmitting} onClick={() => onSubmitReply(c.id)}>
                  {isSubmitting ? "..." : "Send"}
                </Button>
              </div>
            )}

            {!collapsedComments[c.id] && c.replies && (
              <CommentThread
                comments={c.replies}
                collapsedComments={collapsedComments}
                showReplyInput={showReplyInput}
                replyContents={replyContents}
                isSubmitting={isSubmitting}
                currentUserName={currentUserName}
                onToggleCollapse={onToggleCollapse}
                onToggleReplyInput={onToggleReplyInput}
                onChangeReply={onChangeReply}
                onSubmitReply={onSubmitReply}
                onDeleteComment={onDeleteComment}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export default CommentThread;


