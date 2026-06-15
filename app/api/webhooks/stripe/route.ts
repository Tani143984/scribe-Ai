// app/api/webhooks/stripe/route.ts
// Stripe calls THIS endpoint when payment events happen.
// e.g., when someone subscribes, pays, or cancels.
//
// CRITICAL: This must verify the webhook signature to prevent fake requests.
// IMPORTANT: Disable body parsing (Stripe needs the raw body to verify signature).

import { NextRequest } from "next/server";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

// Tell Next.js NOT to parse the body — Stripe needs the raw bytes

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw body as string
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  // Verify this request actually came from Stripe (not a fake attacker)
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {

    // ── USER COMPLETES CHECKOUT ────────────────────────────────
    // Fires when someone successfully subscribes
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.CheckoutSession;
      const { workspaceId } = session.metadata!;
      const subscriptionId = session.subscription as string;

      // Fetch full subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;
      const plan = getPlanFromPriceId(priceId);

      // Update our database
      await prisma.subscription.upsert({
        where: { workspaceId },
        create: {
          workspaceId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          plan,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        update: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          plan,
          status: "ACTIVE",
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });

      console.log(`✅ Workspace ${workspaceId} upgraded to ${plan}`);
      break;
    }

    // ── INVOICE PAID (monthly renewal) ────────────────────────
    // Fires every month when the subscription renews successfully
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        await prisma.subscription.update({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: {
            status: "ACTIVE",
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;
    }

    // ── PAYMENT FAILED ─────────────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await prisma.subscription.update({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: "PAST_DUE" },
        });
      }
      break;
    }

    // ── SUBSCRIPTION CANCELLED ─────────────────────────────────
    // Fires when user cancels OR at end of billing period
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: "CANCELED",
          plan: "FREE",    // Downgrade to free plan
          stripePriceId: null,
        },
      });
      break;
    }
  }

  return Response.json({ received: true });
}
