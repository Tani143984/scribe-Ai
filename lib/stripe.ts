// lib/stripe.ts
// All Stripe-related helpers live here.
// We initialize ONE Stripe client and export helper functions.

import Stripe from "stripe";
import { Plan } from "@prisma/client";

// Single Stripe client instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// ─── PLAN LIMITS ─────────────────────────────────────────────
// How many AI credits each plan gets per month
export const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 50,
  PRO: 500,
  TEAM: Infinity, // unlimited
};

// ─── CREATE CHECKOUT SESSION ──────────────────────────────────
// Call this when user clicks "Upgrade to Pro"
// Returns a URL to redirect the user to Stripe's payment page
export async function createCheckoutSession({
  workspaceId,
  userId,
  priceId,
  stripeCustomerId,
}: {
  workspaceId: string;
  userId: string;
  priceId: string;
  stripeCustomerId?: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId, // If they already have a Stripe customer, reuse it
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    // These URLs are where Stripe sends the user after payment
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing`,
    // metadata: passed back to us in the webhook so we know which workspace upgraded
    metadata: {
      workspaceId,
      userId,
    },
  });

  return session;
}

// ─── CREATE BILLING PORTAL SESSION ───────────────────────────
// Call this for "Manage Subscription" button
// Redirects user to Stripe's hosted billing management page
// Users can cancel, upgrade, download invoices — all for free
export async function createBillingPortalSession(stripeCustomerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/billing`,
  });

  return session;
}

// ─── GET PLAN FROM PRICE ID ───────────────────────────────────
// Maps Stripe price IDs back to our Plan enum
export function getPlanFromPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PRO";
  if (priceId === process.env.STRIPE_TEAM_PRICE_ID) return "TEAM";
  return "FREE";
}
