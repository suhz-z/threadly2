import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCommentsRecursive } from "../route"; 

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } } 
) {
  const id = params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
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
      comments,
    });
  } catch (err) {
    console.error("Error fetching post:", err);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}
