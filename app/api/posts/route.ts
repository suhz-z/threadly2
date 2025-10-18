import { NextResponse } from "next/server";
import { PrismaClient } from "../../generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        comments: {
          include: {
            author: true,
            replies: {
              include: { author: true },
            },
          },
          where: { parentId: null },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    if (!content)
      return NextResponse.json({ error: "Missing content" }, { status: 400 });

    const post = await prisma.post.create({
      data: {
        content,
        author: { connect: { email: session.user?.email! } },
      },
      include: {
        author: true,
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("Error creating post:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
