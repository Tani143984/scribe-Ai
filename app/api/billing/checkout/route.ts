// app/api/billing/checkout/route.ts
// Creates a Stripe checkout session when user clicks "Upgrade"

import { NextRequest } from "next/server";
import { requireAuth, requireMember } from "@/lib/middleware";
import { createCheckoutSession } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireAuth();
  if (errorResponse) return errorResponse;

  const { workspaceId, priceId } = await req.json();
  const userId = (session!.user as any).id;

  // Must be at least ADMIN to manage billing
  const { errorResponse: memberError } = await requireMember(
    userId,
    workspaceId,
    "ADMIN"
  );
  if (memberError) return memberError;

  // Get existing Stripe customer ID if they have one
  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId },
  });

  const checkoutSession = await createCheckoutSession({
    workspaceId,
    userId,
    priceId,
    stripeCustomerId: subscription?.stripeCustomerId,
  });

  return Response.json({ url: checkoutSession.url });
}
