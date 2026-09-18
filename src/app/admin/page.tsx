import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { formatPrice, timeAgo } from "@/lib/constants";
import { AdminNav } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Car,
  Clock,
  DollarSign,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  XCircle,
  CreditCard,
  Bitcoin,
} from "lucide-react";

function maskEmail(email: string): string {
  if (!email) return "—";
  const [name, domain] = email.split("@");
  if (!domain) return "—";
  const visible = name.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(2, name.length - 1))}@${domain}`;
}

export const metadata = {
  title: "Admin Panel — Overview",
  description: "Cars Night admin dashboard: users, listings, transactions and revenue overview.",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/signin?callbackUrl=/admin");
  }

  // Run the same queries as /api/admin/stats, but directly against the DB.
  const [
    totalUsers,
    totalListings,
    pendingListings,
    approvedListings,
    rejectedListings,
    totalTransactions,
    revenueAgg,
    saleListings,
    rentListings,
  ] = await Promise.all([
    db.user.count(),
    db.listing.count(),
    db.listing.count({ where: { status: "PENDING" } }),
    db.listing.count({ where: { status: "APPROVED" } }),
    db.listing.count({ where: { status: "REJECTED" } }),
    db.transaction.count({ where: { status: "COMPLETED" } }),
    db.transaction.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    db.listing.count({ where: { category: "SALE" } }),
    db.listing.count({ where: { category: "RENT" } }),
  ]);

  const byCountryRaw = await db.listing.groupBy({
    by: ["country"],
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const recentTxns = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { email: true, name: true } } },
  });

  const revenue = revenueAgg._sum.amount ?? 0;
  const maxCountryCount = byCountryRaw[0]?._count._all ?? 0;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      href: "/admin/users",
      tone: "default" as const,
    },
    {
      label: "Total Listings",
      value: totalListings,
      icon: Car,
      href: "/admin/listings",
      tone: "default" as const,
      sub: `${approvedListings} approved · ${pendingListings} pending · ${rejectedListings} rejected`,
    },
    {
      label: "Pending Approval",
      value: pendingListings,
      icon: Clock,
      href: "/admin/listings?status=PENDING",
      tone: "warning" as const,
    },
    {
      label: "Revenue",
      value: formatPrice(revenue, "USD"),
      icon: DollarSign,
      href: "#",
      tone: "success" as const,
      sub: `${totalTransactions} completed transactions`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Admin Panel</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {user.name || user.email.split("@")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage listings, users, and site settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-1" /> View site
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <AdminNav />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Stat cards */}
          <section aria-label="Overview stats">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <Card
                    key={s.label}
                    className="relative overflow-hidden border-border/70 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {s.label}
                        </CardTitle>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {typeof s.value === "number"
                          ? s.value.toLocaleString()
                          : s.value}
                      </div>
                      {s.sub && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {s.sub}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Listings breakdown + By country */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" /> Listing breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <BreakdownRow
                  label="Approved"
                  value={approvedListings}
                  total={totalListings}
                  color="bg-emerald-500"
                />
                <BreakdownRow
                  label="Pending"
                  value={pendingListings}
                  total={totalListings}
                  color="bg-amber-500"
                />
                <BreakdownRow
                  label="Rejected"
                  value={rejectedListings}
                  total={totalListings}
                  color="bg-rose-500"
                />
                <div className="h-px bg-border" />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-md border border-border/70 p-3">
                    <div className="text-xs text-muted-foreground">For Sale</div>
                    <div className="text-xl font-semibold text-foreground">
                      {saleListings.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-md border border-border/70 p-3">
                    <div className="text-xs text-muted-foreground">For Rent</div>
                    <div className="text-xl font-semibold text-foreground">
                      {rentListings.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="h-4 w-4 text-primary" /> Listings by country (top 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {byCountryRaw.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No listings yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {byCountryRaw.map((c) => {
                      const count = c._count._all;
                      const pct = maxCountryCount > 0 ? (count / maxCountryCount) * 100 : 0;
                      return (
                        <li key={c.country} className="text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-foreground line-clamp-1">
                              {c.country}
                            </span>
                            <span className="text-muted-foreground tabular-nums">
                              {count.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Recent transactions */}
          <section>
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-primary" /> Recent transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTxns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No transactions yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Credits</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTxns.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {timeAgo(t.createdAt)}
                            </TableCell>
                            <TableCell className="max-w-[180px] truncate" title={t.user?.email || ""}>
                              {t.user?.email ? maskEmail(t.user.email) : "—"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(t.amount, t.currency)}
                            </TableCell>
                            <TableCell>
                              {t.paymentMethod === "CARD" ? (
                                <Badge variant="secondary" className="gap-1">
                                  <CreditCard className="h-3 w-3" /> CARD
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <Bitcoin className="h-3 w-3" /> CRYPTO
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {t.credits ?? 0}
                            </TableCell>
                            <TableCell>
                              {t.status === "COMPLETED" ? (
                                <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" /> Completed
                                </Badge>
                              ) : t.status === "FAILED" ? (
                                <Badge variant="secondary" className="gap-1 bg-rose-100 text-rose-700">
                                  <XCircle className="h-3 w-3" /> Failed
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700">
                                  <Clock className="h-3 w-3" /> Pending
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {value.toLocaleString()}{" "}
          <span className="text-xs">({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
