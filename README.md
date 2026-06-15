# ScribeAI — AI SaaS Platform

A production-ready multi-tenant AI writing assistant SaaS built with Next.js, Node.js, PostgreSQL, Stripe, and Claude/OpenAI API.

## Live Demo
🔗 [your-app.vercel.app](https://your-app.vercel.app)

## What it does
- Users sign up and create a **workspace** (like Slack workspaces)
- Each workspace has **subscription plans** (Free / Pro / Team)
- Users can generate AI content (blog posts, emails, LinkedIn posts)
- **Billing** is handled by Stripe with usage limits per plan

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Email + Google OAuth)
- **AI**: Claude API (Anthropic) / OpenAI
- **Payments**: Stripe
- **DevOps**: Docker, GitHub Actions, Vercel + Railway

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/yourname/scribeai
cd scribeai
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in your keys (see .env.example)

# 3. Start database
docker-compose up -d

# 4. Run migrations
npx prisma migrate dev

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Folder Structure
See `STRUCTURE.md` for the complete file tree with explanations.
