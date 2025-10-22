// app/api/posts/[id]/comments/route.ts
import { Comment } from "@/types/types";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();





// ✅ Explicitly define the return type
export async function getCommentsRecursive(
  postId: string,
  parentId: string | null = null
): Promise<Comment[]> {
  const comments = await prisma.comment.findMany({
    where: { postId, parentId },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  // ✅ TypeScript can now infer this safely
  const nestedComments: Comment[] = await Promise.all(
    comments.map(async (c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: { name: c.author?.name ?? undefined },
      replies: await getCommentsRecursive(postId, c.id), // recursion
    }))
  );

  return nestedComments;
}


export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const comments = await getCommentsRecursive(id);
    return NextResponse.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
