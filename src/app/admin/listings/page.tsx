import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { AdminNav } from "@/components/admin-nav";
import { ListingAdminTable } from "./listing-admin-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Prisma } from "@prisma/client";

export const metadata = {
  title: "Admin — Listings",
  description: "Moderate and manage all Cars Night listings.",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/signin?callbackUrl=/admin/listings");
  }

  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const statusParam = get("status"); // ALL | PENDING | APPROVED | REJECTED
  const categoryParam = get("category"); // ALL | SALE | RENT
  const q = (get("q") || "").trim();
  const page = Math.max(1, Number(get("page") ?? "1") || 1);

  const where: Prisma.ListingWhereInput = {};
  if (statusParam && statusParam !== "ALL") where.status = statusParam;
  if (categoryParam && (categoryParam === "SALE" || categoryParam === "RENT")) {
    where.category = categoryParam;
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { make: { contains: q } },
      { model: { contains: q } },
    ];
  }

  const skip = (page - 1) * PAGE_SIZE;
  const [items, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.listing.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Pass plain JSON-serializable rows to the client component.
  const rows = items.map((l) => ({
    id: l.id,
    title: l.title,
    make: l.make,
    model: l.model,
    category: l.category,
    price: l.price,
    currency: l.currency,
    country: l.country,
    city: l.city,
    status: l.status,
    featured: l.featured,
    views: l.views,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    images: (() => {
      try {
        const arr = JSON.parse(l.images);
        return Array.isArray(arr) ? arr.filter((x: unknown) => typeof x === "string") : [];
      } catch {
        return [];
      }
    })(),
    user: l.user ? { id: l.user.id, name: l.user.name, email: l.user.email } : null,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Admin Panel · Listings</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Manage listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Approve, reject, feature, or delete user listings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to overview
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <AdminNav />
        <div className="flex-1 min-w-0">
          <ListingAdminTable
            rows={rows}
            page={page}
            totalPages={totalPages}
            total={total}
            filters={{ status: statusParam || "ALL", category: categoryParam || "ALL", q }}
          />
        </div>
      </div>
    </div>
  );
}
