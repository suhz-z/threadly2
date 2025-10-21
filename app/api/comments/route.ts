// Comments API endpoint for creating new comments
// Handles POST requests to create comments on posts with optional parent comments (replies)

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// POST handler for creating new comments
export async function POST(req: Request) {
  try {
    // Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse comment data from request
    const { postId, parentId, content, userEmail } = await req.json();

    // Validate required fields
    if (!content || !postId || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new comment in database
    const newComment = await prisma.comment.create({
      data: {
        content,
        post: { connect: { id: postId } }, // Link to post
        parent: parentId ? { connect: { id: parentId } } : undefined, // Optional parent for replies
        author: { connect: { email: userEmail } }, // Link to author
      },
      include: { author: true }, // Include author info in response
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (err: unknown) {
    // Handle Prisma-specific errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(" Prisma Known Error:", err.code, err.message, err.meta);
      return NextResponse.json(
        { error: `Database error (${err.code})` },
        { status: 500 }
      );
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      console.error(" Prisma Validation Error:", err.message);
      return NextResponse.json(
        { error: "Invalid data provided to Prisma" },
        { status: 400 }
      );
    }

    // Generic error handling
    console.error(" Unknown error in /api/comments:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Ensure database connection is closed
  }
}
