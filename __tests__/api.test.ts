// __tests__/api.test.ts
// Tests for the most important parts of the app.
// Run: npm test

// NOTE: We mock external services (Prisma, Stripe, Anthropic) so tests run
// without real API keys or a real database.

import { checkUsageLimit } from "@/lib/ai";
import { getPlanFromPriceId, PLAN_LIMITS } from "@/lib/stripe";

// ── MOCK PRISMA ───────────────────────────────────────────────
// We don't want tests to hit a real database
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    subscription: {
      findUnique: jest.fn(),
    },
    aIRequest: {
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ─────────────────────────────────────────────────────────────
describe("Plan limits", () => {
  it("FREE plan has 50 credit limit", () => {
    expect(PLAN_LIMITS.FREE).toBe(50);
  });

  it("PRO plan has 500 credit limit", () => {
    expect(PLAN_LIMITS.PRO).toBe(500);
  });

  it("TEAM plan is unlimited", () => {
    expect(PLAN_LIMITS.TEAM).toBe(Infinity);
  });
});

// ─────────────────────────────────────────────────────────────
describe("getPlanFromPriceId", () => {
  it("returns FREE for unknown price ID", () => {
    expect(getPlanFromPriceId("unknown_price")).toBe("FREE");
  });
});

// ─────────────────────────────────────────────────────────────
describe("checkUsageLimit", () => {
  it("allows usage when under limit", async () => {
    (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue({
      plan: "PRO",
    });
    (mockPrisma.aIRequest.count as jest.Mock).mockResolvedValue(100);

    const result = await checkUsageLimit("workspace-123");

    expect(result.allowed).toBe(true);
    expect(result.used).toBe(100);
    expect(result.limit).toBe(500);
    expect(result.plan).toBe("PRO");
  });

  it("blocks usage when at limit", async () => {
    (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue({
      plan: "FREE",
    });
    (mockPrisma.aIRequest.count as jest.Mock).mockResolvedValue(50);

    const result = await checkUsageLimit("workspace-123");

    expect(result.allowed).toBe(false);
    expect(result.used).toBe(50);
    expect(result.limit).toBe(50);
  });

  it("defaults to FREE plan if no subscription found", async () => {
    (mockPrisma.subscription.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.aIRequest.count as jest.Mock).mockResolvedValue(10);

    const result = await checkUsageLimit("workspace-new");

    expect(result.plan).toBe("FREE");
    expect(result.limit).toBe(50);
  });
});
