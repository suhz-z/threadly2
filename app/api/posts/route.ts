// Posts API endpoints for fetching and creating posts
// Handles GET (fetch all posts with comments) and POST (create new post) operations

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createPostSchema } from "@/lib/validation";
import { jsonError, jsonOk } from "@/lib/http";

 

 

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
    return jsonError("Failed to load posts", 500);
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
    const body = await req.json();
    const parse = createPostSchema.safeParse(body);
    if (!parse.success) {
      const msg = parse.error.issues[0]?.message || "Invalid input";
      return jsonError(msg, 400);
    }

    // Create new post in database, linking to authenticated user
    const post = await prisma.post.create({
      data: {
        content: parse.data.content,
        author: { connect: { email: session.user.email } }, // Connect to user by email
      },
      include: { author: true },
    });

    return jsonOk(post, { status: 201 });
  } catch (err) {
    console.error("Error creating post:", err);
    return jsonError("Failed to create post", 500);
  }
}
