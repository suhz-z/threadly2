import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCommentsRecursive } from "../route"; // reuse from /api/posts/route.ts

const prisma = new PrismaClient();

// ✅ This is REQUIRED — Next.js only recognizes named exports
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Fetch comments for this post using the recursive helper
    const comments = await getCommentsRecursive(post.id);

    return NextResponse.json({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      author: { name: post.author?.name ?? undefined },
      comments,
    });
  } catch (err) {
    console.error("Error fetching post:", err);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
