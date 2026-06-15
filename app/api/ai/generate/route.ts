// app/api/ai/generate/route.ts
// Frontend calls this -> we call Claude (or mock) -> stream response back.

import { NextRequest } from "next/server";
import { requireAuth, requireMember } from "@/lib/middleware";
import { checkUsageLimit, generateContent } from "@/lib/ai";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { feature, prompt, workspaceId } = await req.json();

  const { errorResponse: memberError } = await requireMember(
    (session!.user as any).id,
    workspaceId
  );
  if (memberError) return memberError;

  const usage = await checkUsageLimit(workspaceId);
  if (!usage.allowed) {
    return Response.json(
      {
        error: `Monthly limit reached. You've used ${usage.used}/${usage.limit} AI credits.`,
        upgradeRequired: true,
      },
      { status: 429 }
    );
  }

  const promptConfig = await prisma.promptConfig.findUnique({
    where: { workspaceId },
  });

  const generator = generateContent({
    userId: (session!.user as any).id,
    workspaceId,
    feature,
    userPrompt: prompt,
    systemPromptOverride: promptConfig?.systemPrompt || undefined,
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
      } catch (err) {
        console.error("Stream error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
