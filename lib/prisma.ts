// lib/prisma.ts
// WHY THIS FILE EXISTS:
// In development, Next.js hot-reloads the server.
// Without this, each reload creates a NEW database connection,
// and you'll run out of connections quickly.
// This file ensures only ONE Prisma client exists globally.

import { PrismaClient } from "@prisma/client";

// Extend the global Node.js type to include prisma
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

// In development: save to global so it survives hot-reloads
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
