// User registration API endpoint
// Handles user signup with email, password, and optional name validation

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // Parse request body for user data
    const { name, email, password } = await req.json();

    // Validate required fields
    if (!email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: "User already exists" }, { status: 400 });

    // Hash password with bcrypt
    const hashed = await bcrypt.hash(password, 10);
    // Create new user in database
    const user = await prisma.user.create({
      data: { name: name || null, email, password: hashed },
    });

    // Return success response with user data
    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
