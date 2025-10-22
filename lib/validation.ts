import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().trim().min(1, "Missing content").max(500, "Too long"),
});

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  parentId: z.string().min(1).optional().nullable(),
  content: z.string().trim().min(1, "Missing content").max(500, "Too long"),
  userEmail: z.string().email(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;


