import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password, workspaceName } = await req.json();

  if (!name || !email || !password || !workspaceName) {
    return Response.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return Response.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const baseSlug = workspaceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug;
  const slugExists = await prisma.workspace.findUnique({ where: { slug } });
  if (slugExists) {
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        slug,
      },
    });

    await tx.member.create({
      data: {
        userId: user.id,
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

    return { user, workspace };
  });

  return Response.json({
    success: true,
    userId: result.user.id,
    workspaceId: result.workspace.id,
  });
}