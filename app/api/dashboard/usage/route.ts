// app/api/dashboard/usage/route.ts
// Returns usage data for the dashboard charts

import { NextRequest } from "next/server";
import { requireAuth, requireMember } from "@/lib/middleware";
import { checkUsageLimit } from "@/lib/ai";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) {
    return Response.json({ error: "workspaceId required" }, { status: 400 });
  }

  const userId = (session!.user as any).id;

  const { errorResponse: memberError } = await requireMember(userId, workspaceId);
  if (memberError) return memberError;

  // Get usage for last 7 days (for the chart)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const requests = await prisma.aIRequest.findMany({
    where: {
      workspaceId,
      createdAt: { gte: sevenDaysAgo },
    },
    select: { createdAt: true, feature: true, tokensUsed: true },
  });

  // Group by day for the chart
  const byDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDay[d.toISOString().split("T")[0]] = 0;
  }

  requests.forEach((r) => {
    const day = r.createdAt.toISOString().split("T")[0];
    if (byDay[day] !== undefined) byDay[day]++;
  });

  const chartData = Object.entries(byDay).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
    requests: count,
  }));

  // Get plan usage summary
  const usageSummary = await checkUsageLimit(workspaceId);

  return Response.json({ chartData, usageSummary });
}
