import { requireAuth } from "@/lib/middleware";
import prisma from "@/lib/prisma";

export async function GET() {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const userId = (session!.user as any).id;

  const membership = await prisma.member.findFirst({
    where: { userId },
    include: { workspace: true },
  });

  if (!membership) {
    return Response.json(
      { error: "No workspace found for this user." },
      { status: 404 }
    );
  }

  return Response.json({
    workspaceId: membership.workspace.id,
    workspaceName: membership.workspace.name,
    role: membership.role,
  });
}
