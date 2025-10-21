// app/api/auth/[...nextauth]/route.ts - NextAuth configuration for authentication
// Handles user login with credentials provider using Prisma and bcrypt

import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()


// NextAuth configuration object
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // Custom authorization function for email/password login
      async authorize(credentials) {
        // Validate input credentials
        if (!credentials?.email || !credentials.password) return null;

        // Find user by email in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        // Verify password using bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Return user object for session
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const, // Use JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for JWT signing
};

// Create NextAuth handler with our configuration
const handler = NextAuth(authOptions);
// Export handler for both GET and POST requests
export { handler as GET, handler as POST };
