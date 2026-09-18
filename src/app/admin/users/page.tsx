import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { AdminNav } from "@/components/admin-nav";
import { UsersAdminTable } from "./users-admin-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Prisma } from "@prisma/client";

export const metadata = {
  title: "Admin — Users",
  description: "Manage Cars Night user accounts.",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    redirect("/signin?callbackUrl=/admin/users");
  }

  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = (get("q") || "").trim();
  const page = Math.max(1, Number(get("page") ?? "1") || 1);

  const where: Prisma.UserWhereInput = {};
  if (q) {
    where.OR = [
      { email: { contains: q } },
      { name: { contains: q } },
      { country: { contains: q } },
      { city: { contains: q } },
    ];
  }

  const skip = (page - 1) * PAGE_SIZE;
  const [items, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        country: true,
        city: true,
        freePostsUsed: true,
        listingCredits: true,
        banned: true,
        createdAt: true,
      },
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const rows = items.map((u) => ({
    ...u,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Admin Panel · Users</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Manage users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ban, unban, promote, or adjust credits for user accounts.
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
          <UsersAdminTable
            rows={rows}
            page={page}
            totalPages={totalPages}
            total={total}
            currentAdminId={admin.id}
            filterQ={q}
          />
        </div>
      </div>
    </div>
  );
}
