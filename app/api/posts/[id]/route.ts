import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCommentsRecursive } from "./comments/route";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } 
) {
  const { id } = await context.params; 

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: { author: true, replies: true },
        },
        _count: { select: { comments: true } }, 
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await getCommentsRecursive(id);

    return NextResponse.json({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      author: { name: post.author?.name ?? undefined },
      commentCount: post._count.comments,
      comments,
    });
  } catch (err) {
    console.error("Error fetching post:", err);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}
