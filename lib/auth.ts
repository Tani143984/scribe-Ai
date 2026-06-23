import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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

        const bcrypt = require("bcryptjs");
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  events: {
    // This fires after EVERY sign-in (Google OAuth or credentials)
    // If the user has no workspace yet, create one automatically
    async signIn({ user }) {
      if (!user.id) return;

      const existing = await prisma.member.findFirst({
        where: { userId: user.id },
      });

      if (!existing) {
        // New Google OAuth user — create their workspace automatically
        const name = user.name || user.email?.split("@")[0] || "My Workspace";
        const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        let slug = baseSlug;
        const slugExists = await prisma.workspace.findUnique({ where: { slug } });
        if (slugExists) {
          slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        }

        await prisma.$transaction(async (tx) => {
          const workspace = await tx.workspace.create({
            data: { name: `${name}'s Workspace`, slug },
          });

          await tx.member.create({
            data: {
              userId: user.id!,
              workspaceId: workspace.id,
              role: "OWNER",
            },
          });

          await tx.subscription.create({
            data: {
              workspaceId: workspace.id,
              stripeCustomerId: `pending_${workspace.id}`,
              plan: "FREE",
            },
          });

          await tx.promptConfig.create({
            data: {
              workspaceId: workspace.id,
              brandVoice: "professional",
            },
          });
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
