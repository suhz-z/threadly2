// Individual comment operations API endpoint
// Handles DELETE requests to remove specific comments (only by comment author)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// DELETE handler for removing a specific comment
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Extract comment ID from URL parameters
  const { id } = await context.params;
  // Get authenticated user session
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the comment and include author info
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });

    // Check if comment exists
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify user owns the comment
    if (comment.author?.email !== session.user.email) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // Delete the comment
    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
