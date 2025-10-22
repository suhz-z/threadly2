// Posts API endpoints for fetching and creating posts
// Handles GET (fetch all posts with comments) and POST (create new post) operations

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

import { Comment, Post } from "@/types/types";

// Recursive function to fetch comments and their nested replies
// export async function getCommentsRecursive(
//   postId: string,
//   parentId: string | null = null
// ): Promise<Comment[]> {
//   // Fetch comments for the given post and parent (null for top-level)
//   const comments = await prisma.comment.findMany({
//     where: { postId, parentId },
//     include: { author: true },
//     orderBy: { createdAt: "asc" },
//   });

//   // Recursively build comment tree with replies
//   return Promise.all(
//     comments.map(async (c) => ({
//       id: c.id,
//       content: c.content,
//       createdAt: c.createdAt.toISOString(),
//       author: { name: c.author?.name ?? undefined }, // Convert null to undefined
//       replies: await getCommentsRecursive(postId, c.id), // Fetch nested replies
//     }))
//   );
// }

// fetch all posts

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      posts.map((p) => ({
        id: p.id,
        content: p.content,
        createdAt: p.createdAt.toISOString(),
        author: { name: p.author?.name ?? undefined },
        commentCount: p._count.comments,
      }))
    );
  } catch (err) {
    console.error("Error fetching posts:", err);
    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 }
    );
  }
}

// POST handler - create a new post (requires authentication)
export async function POST(req: Request) {
  try {
    // Get user session for authentication
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse post content from request
    const { content } = await req.json();

    // Validate content is provided
    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    // Create new post in database, linking to authenticated user
    const post = await prisma.post.create({
      data: {
        content,
        author: { connect: { email: session.user.email } }, // Connect to user by email
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
