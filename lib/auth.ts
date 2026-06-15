// lib/auth.ts
// This is the brain of your authentication system.
// It configures HOW users log in and WHAT data is in their session.

import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  // Prisma adapter: stores sessions/users in your PostgreSQL database
  adapter: PrismaAdapter(prisma) as any,

  // JWT strategy: session data stored in a cookie (faster, no DB lookup on every request)
  session: {
    strategy: "jwt",
  },

  providers: [
    // --- Google Login ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // --- Email + Password Login ---
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        // Compare hashed password
        const bcrypt = require("bcryptjs");
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return user;
      },
    }),
  ],

  callbacks: {
    // This runs every time a JWT token is created/updated
    // We add the userId to the token so we can use it in API routes
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // This runs every time a session is checked (e.g., useSession())
    // We expose the userId to the frontend
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",    // Custom login page (we'll build this)
    error: "/login",     // Redirect errors to login page
  },
};
