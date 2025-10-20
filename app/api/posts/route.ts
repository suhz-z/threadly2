import { NextResponse } from "next/server";
import { PrismaClient } from "../../generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

import { Comment,Post } from "@/types/types";


export async function getCommentsRecursive(
  postId: string,
  parentId: string | null = null
): Promise<Comment[]> {
  const comments = await prisma.comment.findMany({
    where: { postId, parentId },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  return Promise.all(
    comments.map(async (c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: { name: c.author?.name ?? undefined }, // <-- convert null to undefined
      replies: await getCommentsRecursive(postId, c.id),
    }))
  );
}



export async function GET() {
  try {
    const postsRaw = await prisma.post.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });

    const posts: Post[] = await Promise.all(
      postsRaw.map(async (p) => ({
        id: p.id,
        content: p.content,
        createdAt: p.createdAt.toISOString(),
        author: { name: p.author?.name ?? undefined },
        comments: await getCommentsRecursive(p.id),
      }))
    );

    return NextResponse.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // If session or email is missing, return 401
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Missing content" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content,
        author: { connect: { email: session.user.email } }, // safe now
      },
      include: { author: true },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("Error creating post:", err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
