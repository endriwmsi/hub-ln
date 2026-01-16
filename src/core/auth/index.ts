// Client-side exports (safe for Client Components)

// Server-side exports (ONLY for Server Components/Actions)
// Types can be safely exported as they don't contain runtime code
export type { ErrorCode, Session, User } from "../../lib/auth";
export * from "./auth-client";

// ⚠️ The following exports require server-side modules (db, etc)
// Import directly from "@/lib/auth" or "@/core/auth/dal" in server code only
// export { auth } from "../../lib/auth";
export {
  getSession,
  requireActiveSubscription,
  requireAdmin,
  verifySession,
} from "./dal";
