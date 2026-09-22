/**
 * Env setup — must be imported as the FIRST import in the root layout so it
 * runs before any module that reads env vars (especially `next-auth`, which
 * does `new URL(process.env.NEXTAUTH_URL)` at module load time and throws
 * `TypeError: Invalid URL` if the env var is empty/missing).
 *
 * In ES modules, imports are hoisted and evaluated in source order, so
 * importing this file before `next-auth`-related imports guarantees the
 * fallback is in place before next-auth's module-level code runs.
 */

// NEXTAUTH_URL fallback — Vercel sets VERCEL_URL automatically; use it if
// available, otherwise fall back to localhost for local dev / build time.
if (typeof process !== "undefined" && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}
