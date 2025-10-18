import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "../../generated/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, parentId, content, userEmail } = await req.json();

    if (!content || !postId || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        post: { connect: { id: postId } },
        parent: parentId ? { connect: { id: parentId } } : undefined,
        author: { connect: { email: userEmail } },
      },
      include: { author: true },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (err: unknown) {
    // Prisma-specific error handling
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

    // Generic fallback for any other runtime error
    console.error(" Unknown error in /api/comments:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
