// prisma/seed.ts
// Run: npx ts-node prisma/seed.ts
// This fills your DB with demo data so the dashboard doesn't look empty

import { PrismaClient, Plan, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@scribeai.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@scribeai.com",
    },
  });

  // Create a demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-workspace" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo-workspace",
    },
  });

  // Add user as owner of workspace
  await prisma.member.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: Role.OWNER,
    },
  });

  // Create a Pro subscription
  await prisma.subscription.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      stripeCustomerId: "cus_demo_123",
      plan: Plan.PRO,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // Create demo prompt config
  await prisma.promptConfig.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: {
      workspaceId: workspace.id,
      brandVoice: "professional",
      systemPrompt: "You are a professional content writer. Write clear, engaging content.",
    },
  });

  // Create sample AI requests for the usage chart
  const features = ["blog-post", "email", "linkedin"];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const count = Math.floor(Math.random() * 8) + 2;

    for (let j = 0; j < count; j++) {
      await prisma.aIRequest.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          prompt: "Write a blog post about AI trends",
          response: "AI is transforming industries...",
          tokensUsed: Math.floor(Math.random() * 500) + 100,
          feature: features[Math.floor(Math.random() * features.length)],
          createdAt: date,
        },
      });
    }
  }

  console.log("✅ Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
