// Comments API endpoint for creating new comments
// Handles POST requests to create comments on posts with optional parent comments (replies)

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { createCommentSchema } from "@/lib/validation";
import { jsonError, jsonOk } from "@/lib/http";

 

// POST handler for creating new comments
export async function POST(req: Request) {
  try {
    // Authenticate user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate comment data
    const body = await req.json();
    const parse = createCommentSchema.safeParse(body);
    if (!parse.success) {
      const msg = parse.error.issues[0]?.message || "Invalid input";
      return jsonError(msg, 400);
    }

    // Create new comment in database
    const newComment = await prisma.comment.create({
      data: {
        content: parse.data.content,
        post: { connect: { id: parse.data.postId } },
        parent: parse.data.parentId ? { connect: { id: parse.data.parentId } } : undefined,
        author: { connect: { email: parse.data.userEmail } },
      },
      include: { author: true }, // Include author info in response
    });

    return jsonOk(newComment, { status: 201 });
  } catch (err: unknown) {
    // Handle Prisma-specific errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(" Prisma Known Error:", err.code, err.message, err.meta);
      return jsonError(`Database error (${err.code})`, 500);
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      console.error(" Prisma Validation Error:", err.message);
      return jsonError("Invalid data provided to Prisma", 400);
    }

    // Generic error handling
    console.error(" Unknown error in /api/comments:", err);
    return jsonError("Internal Server Error", 500);
  }
}
