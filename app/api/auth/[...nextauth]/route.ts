// app/api/auth/[...nextauth]/route.ts
// This single file handles ALL auth routes:
// - GET/POST /api/auth/signin
// - GET/POST /api/auth/signout
// - GET/POST /api/auth/callback/google
// - GET /api/auth/session
// NextAuth does all the heavy lifting automatically.

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
