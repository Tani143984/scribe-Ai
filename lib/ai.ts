// lib/ai.ts
// Uses Google's Gemini API for AI generation.
// Falls back to a MOCK streaming response if the call fails,
// so the demo always works.

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "./prisma";
import { PLAN_LIMITS } from "./stripe";
import { Plan } from "@prisma/client";

const FEATURE_PROMPTS: Record<string, string> = {
  "blog-post": "Write a well-structured blog post with an introduction, 3 main sections, and a conclusion.",
  "email": "Write a professional email. Include subject line, greeting, body, and sign-off.",
  "linkedin": "Write an engaging LinkedIn post. Use short paragraphs, relevant emojis, and a call-to-action.",
};

function hasRealApiKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!key && key.length > 10 && !key.includes("...");
}

export async function checkUsageLimit(workspaceId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  plan: Plan;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId },
  });

  const plan = subscription?.plan || "FREE";
  const limit = PLAN_LIMITS[plan];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.aIRequest.count({
    where: {
      workspaceId,
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    allowed: used < limit,
    used,
    limit: limit === Infinity ? 999999 : limit,
    plan,
  };
}

export async function* generateContent({
  userId,
  workspaceId,
  feature,
  userPrompt,
  systemPromptOverride,
}: {
  userId: string;
  workspaceId: string;
  feature: string;
  userPrompt: string;
  systemPromptOverride?: string;
}): AsyncGenerator<string> {
  const featureInstruction = FEATURE_PROMPTS[feature] || "Complete the following task:";
  const systemPrompt =
    systemPromptOverride ||
    `You are an expert content writer. ${featureInstruction} Be concise, engaging, and high-quality.`;

  let fullResponse = "";
  let tokensUsed = 0;
  let usedMock = false;

  if (hasRealApiKey()) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContentStream(userPrompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullResponse += text;
          yield text;
        }
      }

      // Rough token estimate (Gemini stream doesn't always return usage easily)
      tokensUsed = Math.round(fullResponse.length / 4);
    } catch (err) {
      console.error("Gemini API call failed, falling back to mock:", err instanceof Error ? err.message : err);
      usedMock = true;
    }
  } else {
    usedMock = true;
  }

  if (usedMock) {
    const mockText = buildMockResponse(feature, userPrompt);
    fullResponse = mockText;
    tokensUsed = Math.round(mockText.length / 4);

    const words = mockText.split(" ");
    for (const word of words) {
      yield word + " ";
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  }

  await prisma.aIRequest.create({
    data: {
      userId,
      workspaceId,
      prompt: userPrompt,
      response: fullResponse,
      tokensUsed,
      feature,
    },
  }).catch(console.error);
}

function buildMockResponse(feature: string, prompt: string): string {
  const note = "[Demo mode: AI API unavailable, showing a sample response.]";

  if (feature === "blog-post") {
    return `${note}

# ${prompt}

## Introduction
This is a sample blog post generated in demo mode. It demonstrates how ScribeAI streams content in real time to the user interface, word by word, just like a live AI response.

## Main Point One
ScribeAI's architecture supports multi-tenant workspaces, usage-based billing tiers, and per-workspace customization of the AI's tone and behavior.

## Main Point Two
The streaming response you're seeing right now is generated locally and sent to your browser in small chunks, mimicking exactly how the real AI streaming integration works.

## Conclusion
To enable real AI-generated content, check your Gemini API key configuration.`;
  }

  if (feature === "email") {
    return `${note}

Subject: Following up on: ${prompt}

Hi there,

This is a sample email generated in demo mode, showing how ScribeAI formats professional email content with a subject line, greeting, body, and sign-off.

Best regards,
ScribeAI`;
  }

  return `${note}

🚀 ${prompt}

This is a sample LinkedIn post generated in demo mode. It shows short paragraphs, relevant formatting, and a call-to-action — exactly how the real AI-generated post would look.

What's your experience with this? Let me know in the comments! 👇

#AI #SaaS #Demo`;
}
