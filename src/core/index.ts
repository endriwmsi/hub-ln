// Core exports

// Auth exports (Client Components safe)
// For server-side auth, import from "@/lib/auth" directly
export * from "./auth";

// ⚠️ Database should ONLY be imported in server-side code
// Client Components cannot use Node.js modules like 'pg'
// Use: import { db } from "@/core/db" only in Server Components/Actions

// Providers (safe for all components)
export * from "./providers";
