// Shared helpers for the public listing browse pages (cars-for-sale, cars-for-rent).
// These pages share the same query / pagination logic but differ by category and price range.

import { buildOrderBy, buildWhere, parseListingQuery, type ListingQuery } from "@/lib/constants";

export const BROWSE_PAGE_SIZE = 12;

/** Convert Next.js 16 searchParams (Promise<Record<string, string | string[] | undefined>>)
 *  into a plain URLSearchParams that parseListingQuery can consume. */
export function searchParamsToURLSearchParams(
  sp: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const url = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const x of v) if (x) url.append(k, x);
    } else if (v) {
      url.set(k, v);
    }
  }
  return url;
}

/** Pick the first value of a search-param (handles string | string[]). */
export function firstParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}

/** Build the pagination URL for a browse page, preserving all other params. */
export function buildPageUrl(
  basePath: string,
  sp: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const x of v) if (x) params.append(k, x);
    } else if (v) {
      params.set(k, v);
    }
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Compose a ListingQuery for a browse page, forcing category + APPROVED status. */
export function buildBrowseQuery(
  sp: Record<string, string | string[] | undefined>,
  category: "SALE" | "RENT",
): ListingQuery {
  const url = searchParamsToURLSearchParams(sp);
  const q = parseListingQuery(url);
  q.category = category;
  q.status = "APPROVED";
  const page = Math.max(1, Number(firstParam(sp, "page")) || 1);
  q.page = page;
  q.pageSize = BROWSE_PAGE_SIZE;
  return q;
}

/** Convenience: build the Prisma where + orderBy for a browse page. */
export function buildBrowseClause(q: ListingQuery) {
  const where = buildWhere(q, { approvedOnly: true });
  // Force category + status (defense in depth — buildWhere already does this when q.category is set).
  where.category = q.category as "SALE" | "RENT";
  where.status = "APPROVED";
  const orderBy = buildOrderBy(q);
  return { where, orderBy };
}
