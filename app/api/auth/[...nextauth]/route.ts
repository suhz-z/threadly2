

import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";


// AUTHENTICATION OPTIONS

export const authOptions: NextAuthOptions = {
  providers: [
   
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // This function runs when user submits email/password form
      async authorize(credentials) {
        // Step 1: Check if email and password were provided
        if (!credentials?.email || !credentials.password) return null;

        // Step 2: Look up user in database by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        // Step 3: Verify password matches the hashed password in database
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Step 4: Return user info to create session
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    
    
    // GOOGLE OAUTH LOGIN
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  
 
  // SESSION CONFIGURATION
 
  session: {
    strategy: "jwt" as const, // Store session data in JWT token (not database)
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret key to sign JWT tokens
  
 
  // OAUTH CALLBACKS
  
  callbacks: {
    // This runs when user signs in with Google
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        // Create or update user in our database when they sign in with Google
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
          },
          create: {
            email: user.email,
            name: user.name ?? null,
            // Google users don't need a real password, so we store a random one
            password: Math.random().toString(36).slice(2),
          },
        });
      }
      return true; // Allow the sign-in to proceed
    },
  },
};

// Create NextAuth handler with our configuration
const handler = NextAuth(authOptions);
// Export handler for both GET and POST requests
export { handler as GET, handler as POST };
