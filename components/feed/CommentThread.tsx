"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Comment } from "@/types/types";
import { ChevronDown, ChevronRight, Reply, Trash2 } from "lucide-react";
import { Input } from "../ui/input";

interface CommentThreadProps {
  comment: Comment;
  addReply: (content: string, parentId?: string) => void;
  deleteComment: (id: string) => void;
  sessionUser?: string;
}

export function CommentThread({
  comment,
  addReply,
  deleteComment,
  sessionUser,
}: CommentThreadProps) {
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const isOwner = comment.author?.name === sessionUser;

  return (
    <div className="ml-4 mt-3 border-l border-neutral-200 dark:border-neutral-700 pl-3">
      <div className="flex justify-between items-start text-sm">
        <div>
          <p className="flex items-center gap-2">
            <strong>{comment.author?.name || "Unknown"}</strong>
            <span className="text-xs text-neutral-500">{comment.createdAt}</span>
          </p>
          <p className="text-sm text-neutral-800 dark:text-neutral-300 mt-1">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comment.replies?.length ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReplies((prev) => !prev);
              }}
            >
              {showReplies ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : null}

          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteComment(comment.id);
              }}
              title="Delete comment"
              className="text-gray-500 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Reply button */}
      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowReplyInput((prev) => !prev);
          }}
          className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-white"
        >
          <Reply size={12} /> Reply
        </button>
      </div>

      {/* Reply input */}
      {showReplyInput && (
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="flex-1 text-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              addReply(replyContent, comment.id);
              setReplyContent("");
              setShowReplyInput(false);
            }}
          >
            Send
          </Button>
        </div>
      )}

      {/* Replies */}
      {showReplies &&
        comment.replies?.map((c) => (
          <CommentThread
            key={c.id}
            comment={c}
            addReply={addReply}
            deleteComment={deleteComment}
            sessionUser={sessionUser}
          />
        ))}
    </div>
  );
}
