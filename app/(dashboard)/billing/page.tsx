"use client";

import { useState, useEffect } from "react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: "50 AI credits / month",
    features: ["3 content types", "Standard AI model", "Email support"],
    priceId: null,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    credits: "500 AI credits / month",
    features: [
      "All content types",
      "Faster AI model",
      "Custom brand voice",
      "Priority support",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    popular: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/ month",
    credits: "Unlimited credits",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Team workspaces",
      "Admin dashboard",
      "API access",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
  },
];

export default function BillingPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("FREE");
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workspaces/me")
      .then((r) => r.json())
      .then((w) => setWorkspaceId(w.workspaceId || null))
      .catch(() => setWorkspaceId(null));
  }, []);

  async function handleUpgrade(priceId: string, planName: string) {
    if (!workspaceId) return;
    setLoading(planName);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, priceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your plan and payment details
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrent = plan.name.toUpperCase() === currentPlan;
          return (
            <div
              key={plan.name}
              className={`bg-white rounded-xl border p-6 flex flex-col ${
                plan.popular
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="mb-3">
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <div className="text-xs text-blue-600 font-medium mt-1">
                  {plan.credits}
                </div>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="text-center py-2.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg">
                  Current plan
                </div>
              ) : plan.priceId ? (
                <button
                  onClick={() => handleUpgrade(plan.priceId!, plan.name)}
                  disabled={loading === plan.name || !workspaceId}
                  className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading === plan.name ? "Redirecting..." : `Upgrade to ${plan.name}`}
                </button>
              ) : (
                <button className="w-full border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                  Downgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-900">
            Manage subscription
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Update payment method, download invoices, or cancel
          </div>
        </div>
        <button className="text-sm text-blue-600 hover:underline font-medium">
          Open billing portal →
        </button>
      </div>
    </div>
  );
}
