// lib/middleware.ts
// Helper functions to protect API routes.
// Use these at the top of every API route that needs auth.

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import prisma from "./prisma";
import { Role } from "@prisma/client";

// ─── GET SESSION OR THROW ─────────────────────────────────────
// Use this in API routes to get the current user.
// If not logged in, returns a 401 response automatically.
//
// Usage:
//   const { session, errorResponse } = await requireAuth();
//   if (errorResponse) return errorResponse;
//   const userId = session.user.id;
//
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      ),
    };
  }

  return { session, errorResponse: null };
}

// ─── REQUIRE WORKSPACE MEMBERSHIP ────────────────────────────
// Check that the current user is a member of the given workspace.
// Optionally require a minimum role (e.g., only ADMIN can delete members).
//
// Usage:
//   const { member, errorResponse } = await requireMember(userId, workspaceId);
//   if (errorResponse) return errorResponse;
//
export async function requireMember(
  userId: string,
  workspaceId: string,
  minimumRole?: Role
) {
  const member = await prisma.member.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    include: { workspace: true },
  });

  if (!member) {
    return {
      member: null,
      errorResponse: NextResponse.json(
        { error: "You are not a member of this workspace." },
        { status: 403 }
      ),
    };
  }

  // Check role hierarchy: OWNER > ADMIN > MEMBER
  if (minimumRole) {
    const roleOrder = { MEMBER: 0, ADMIN: 1, OWNER: 2 };
    if (roleOrder[member.role] < roleOrder[minimumRole]) {
      return {
        member: null,
        errorResponse: NextResponse.json(
          { error: "You don't have permission to do this." },
          { status: 403 }
        ),
      };
    }
  }

  return { member, errorResponse: null };
}
