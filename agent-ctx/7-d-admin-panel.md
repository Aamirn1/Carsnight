# Task 7-d — Admin Panel Agent

## Goal
Build the admin panel for the Cars Night marketplace:
- `/admin` — Dashboard with overview stats
- `/admin/listings` — Manage all listings (approve/reject/feature/delete)
- `/admin/users` — Manage users (ban/unban/promote/demote/adjust credits)
- `/admin/settings` — Edit site-wide settings

## Files Created
- `src/components/admin-nav.tsx` — Client component for the internal admin sidebar (desktop) + horizontal tabs (mobile).
- `src/app/admin/page.tsx` — Server component. Verifies admin, queries DB directly (same queries as `/api/admin/stats`) to render stat cards, listing breakdown, listings by country bar list, recent transactions table.
- `src/app/admin/listings/page.tsx` — Server component. Reads URL params (`status`, `category`, `q`, `page`), fetches listings with `db.listing.findMany`, passes plain JSON rows to client table.
- `src/app/admin/listings/listing-admin-table.tsx` — Client component. Filter dropdowns (status, category) + search box update URL params. Row dropdown with Approve / Reject / Feature / Unfeature / Delete (alert dialog). Pagination prev/next updates `page` URL param. PATCH `/api/admin/listings` for status/featured, DELETE `/api/listings/[id]` for delete. Toasts on success/error.
- `src/app/admin/users/page.tsx` — Server component. Reads `?q=` and `?page=`, fetches users with `db.user.findMany`. Passes current admin id to client so it can hide self-actions.
- `src/app/admin/users/users-admin-table.tsx` — Client component. Search + pagination. Row dropdown with Ban/Unban (toggle `banned`), Promote/Demote (toggle `role`), Adjust credits (Dialog with number input, 0–1000). All via PATCH `/api/admin/users`. Self-row shows `—` instead of actions.
- `src/app/admin/settings/page.tsx` — Server component. Fetches allowed setting keys via `db.setting.findMany`.
- `src/app/admin/settings/settings-form.tsx` — Client component. Form for site_name, tagline, contact_email, announcement (textarea), hero_video_url. PUT `/api/admin/settings` on save. Validation: email format, URL syntax. Char counters. Toast feedback.

## Testing Results
- Unauthenticated GETs of all four admin routes return `307` redirect to `/signin?callbackUrl=...` (as required).
- Authenticated GETs (after signing in with admin email) all return `200`:
  - `/admin` — renders "Welcome back, ..." + stat cards (Total Users, Total Listings, Pending Approval, Revenue), listings-by-country bar list, recent transactions table.
  - `/admin/listings` — renders Manage listings with filter dropdowns + pagination + actions menu (Approve, Reject, Feature, Unfeature, Delete).
  - `/admin/users` — renders Manage users with search + pagination + actions menu (Ban, Unban, Promote, Demote, Adjust credits).
  - `/admin/settings` — renders Settings form with site name, tagline, contact email, announcement, hero video URL.
- Admin API tested directly with curl:
  - `GET /api/admin/stats` → `200`, returns counts + revenue + byCountry + recentTransactions.
  - `PATCH /api/admin/listings` (featured, status=REJECTED) → `200`, returns updated listing. Restored to APPROVED + featured=true.
  - `PATCH /api/admin/users` (banned, listingCredits) → `200`, returns updated user. Restored to unbanned.
  - `PUT /api/admin/settings` → `200`, returns updated settings. Public `/api/settings` reflects changes.
- `bun run lint`: No errors or warnings in any of my admin files (the remaining lint warnings are pre-existing in other agents' files — `country-city-select.tsx`, `theme-toggle.tsx`, `typewriter.tsx`, `dashboard/page.tsx`).

## Notes
- The admin pages use the global SiteHeader / SiteFooter from the root layout (per project rules — do not add another header/footer).
- The admin nav is an internal navigation (sidebar on md+, horizontal scrollable tabs on mobile) and lives inside the page content area, not in the global header.
- Defense in depth: every admin page checks `user.role === "ADMIN"` server-side and `redirect("/signin?callbackUrl=...")` if not. The admin APIs already enforce this server-side.
- User emails in the recent-transactions table are masked (`j***@example.com`) per the PRD privacy rule.
- A separate agent's bug (`Ethereum` icon missing in `checkout-dialog.tsx`) intermittently caused Turbopack compilation to fail for routes that imported that module; my admin routes don't import it and were unaffected (they returned 200 even during the broken window). The bug also caused `EADDRINUSE` when the dev server tried to restart, but it self-recovered after a short wait.
