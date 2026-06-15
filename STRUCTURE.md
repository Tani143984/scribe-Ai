# STRUCTURE.md — Complete File Tree with Explanations

```
scribeai/
│
├── .github/
│   └── workflows/
│       └── ci.yml              ← GitHub Actions: runs tests on every push
│
├── __tests__/
│   └── api.test.ts             ← Jest tests for usage limits, auth logic
│
├── app/                        ← Next.js App Router (all pages + API routes)
│   │
│   ├── (auth)/                 ← Route group: no layout, just login/signup pages
│   │   └── login/
│   │       └── page.tsx        ← Login page (email + Google OAuth)
│   │
│   ├── (dashboard)/            ← Route group: all pages wrapped in sidebar layout
│   │   ├── layout.tsx          ← Sidebar + navigation (wraps all dashboard pages)
│   │   ├── dashboard/
│   │   │   └── page.tsx        ← Main dashboard: stats + usage chart
│   │   ├── write/
│   │   │   └── page.tsx        ← AI Writer: prompt input + streaming output
│   │   ├── billing/
│   │   │   └── page.tsx        ← Plans + Stripe upgrade buttons
│   │   └── settings/
│   │       └── page.tsx        ← Workspace settings, brand voice config
│   │
│   ├── api/                    ← All backend API routes (Node.js)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts    ← Handles ALL auth (login, logout, OAuth callback)
│   │   ├── ai/
│   │   │   └── generate/
│   │   │       └── route.ts    ← Calls Claude API, streams response back
│   │   ├── billing/
│   │   │   └── checkout/
│   │   │       └── route.ts    ← Creates Stripe checkout session
│   │   ├── dashboard/
│   │   │   └── usage/
│   │   │       └── route.ts    ← Returns usage stats for dashboard chart
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts    ← Stripe webhook: handles payment events
│   │
│   ├── globals.css             ← Tailwind CSS base styles
│   ├── layout.tsx              ← Root layout (wraps everything, adds SessionProvider)
│   └── providers.tsx           ← Client-side providers (NextAuth SessionProvider)
│
├── lib/                        ← Shared utility functions (used by API routes)
│   ├── prisma.ts               ← Prisma client singleton (one DB connection)
│   ├── auth.ts                 ← NextAuth config (providers, callbacks, session)
│   ├── stripe.ts               ← Stripe client + helper functions
│   ├── ai.ts                   ← Claude API integration + usage tracking
│   └── middleware.ts           ← requireAuth() and requireMember() helpers
│
├── prisma/
│   ├── schema.prisma           ← Database schema (ALL tables defined here)
│   └── seed.ts                 ← Demo data for the database
│
├── .env.example                ← Template for environment variables (safe to commit)
├── .gitignore                  ← Files to never commit (node_modules, .env.local, etc.)
├── docker-compose.yml          ← Starts PostgreSQL locally with one command
├── jest.config.ts              ← Jest test runner configuration
├── next.config.js              ← Next.js configuration
├── package.json                ← Dependencies and npm scripts
├── tailwind.config.ts          ← Tailwind CSS configuration
├── tsconfig.json               ← TypeScript configuration
└── README.md                   ← Project documentation (recruiters read this first)
```

## How data flows through the app

```
User types prompt in /write
        ↓
Frontend calls POST /api/ai/generate
        ↓
API route: checks auth → checks workspace membership → checks usage limit
        ↓
Calls Claude API with streaming enabled
        ↓
Streams response tokens back to browser (word by word)
        ↓
After stream ends: saves AIRequest to database (for usage tracking)
```

## How billing works

```
User clicks "Upgrade to Pro" on /billing
        ↓
Frontend calls POST /api/billing/checkout
        ↓
We create a Stripe Checkout Session (gets a URL)
        ↓
Frontend redirects user to Stripe's payment page
        ↓
User pays → Stripe sends POST to /api/webhooks/stripe
        ↓
Webhook handler updates Subscription in database
        ↓
User is now on Pro plan — usage limits lifted
```
