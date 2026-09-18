import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ListChecks,
  Coins,
  Car,
  CreditCard,
  Plus,
  Wallet,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { db } from "@/lib/db";
import { getSessionUser, getUserQuota } from "@/lib/session";
import { toPublicListing, formatPrice, FREE_LISTING_LIMIT } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MyListings } from "@/components/my-listings";

export const dynamic = "force-dynamic";

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/signin?callbackUrl=/dashboard");

  const [quota, listings, transactions, dbUser] = await Promise.all([
    getUserQuota(user.id),
    db.listing.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true, createdAt: true },
    }),
  ]);

  const publicListings = listings.map(toPublicListing);
  const totalSpent = transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const freeUsedPct = Math.min(100, (quota.freeUsed / FREE_LISTING_LIMIT) * 100);
  const quotaLow = quota.total === 0;
  const initials = (user.name || user.email).trim().slice(0, 1).toUpperCase();
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="w-full">
      {/* Admin banner */}
      {isAdmin && (
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>You are signed in as admin.</span>
            <Link href="/admin" className="underline underline-offset-4 flex items-center gap-1">
              Visit the Admin Panel <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-bold shadow-sm shrink-0 overflow-hidden">
            {dbUser?.avatarUrl ? (
              <img
                src={dbUser.avatarUrl}
                alt={user.name || "User avatar"}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user.name || user.email.split("@")[0]}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your listings, track views, and post new ads.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Member since {dbUser?.createdAt ? formatDate(dbUser.createdAt) : "—"}
          </div>
        </div>

        {/* Quota cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Free posts */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Free posts used</CardDescription>
                <ListChecks className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">
                {quota.freeUsed}{" "}
                <span className="text-sm font-medium text-muted-foreground">
                  / {FREE_LISTING_LIMIT}
                </span>
              </div>
              <Progress value={freeUsedPct} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {quota.freeRemaining > 0
                  ? `${quota.freeRemaining} free remaining`
                  : "Free quota used"}
              </p>
            </CardContent>
          </Card>

          {/* Paid credits */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Paid credits</CardDescription>
                <Coins className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{quota.paidRemaining}</div>
              <p className="text-xs text-muted-foreground">
                {quota.paidRemaining > 0 ? "Available to post" : "No paid credits"}
              </p>
            </CardContent>
          </Card>

          {/* Total listings */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Total listings</CardDescription>
                <Car className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{publicListings.length}</div>
              <p className="text-xs text-muted-foreground">
                {publicListings.filter((l) => l.status === "APPROVED").length} live ·{" "}
                {publicListings.filter((l) => l.status === "PENDING").length} pending
              </p>
            </CardContent>
          </Card>

          {/* Total spent */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Total spent</CardDescription>
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{formatPrice(totalSpent, "USD")}</div>
              <p className="text-xs text-muted-foreground">
                Across {transactions.length} transaction{transactions.length === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quota warning + quick actions */}
        {quotaLow && (
          <Card className="border-primary/30 bg-primary/5 shadow-sm">
            <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 grid place-items-center shrink-0">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">You&apos;re out of listing credits</p>
                  <p className="text-sm text-muted-foreground">
                    Buy credits to keep posting ads. Credits never expire.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/pricing">Upgrade now <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/post-ad">
              <Plus className="h-4 w-4" /> Post new ad
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">
              <Coins className="h-4 w-4" /> Buy credits
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" disabled>
            <span>Edit profile</span>
          </Button>
        </div>

        <Separator />

        {/* My listings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-bold tracking-tight">My listings</h2>
              <p className="text-sm text-muted-foreground">
                {publicListings.length} ad{publicListings.length === 1 ? "" : "s"} total
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/post-ad">
                <Plus className="h-4 w-4" /> New ad
              </Link>
            </Button>
          </div>
          <MyListings listings={publicListings} />
        </section>

        <Separator />

        {/* Recent transactions */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Recent transactions</h2>
            <p className="text-sm text-muted-foreground">Your last 10 payments</p>
          </div>
          {transactions.length === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No transactions yet.{" "}
                  <Link href="/pricing" className="text-primary underline underline-offset-4">
                    Browse plans
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {t.credits} credit{t.credits === 1 ? "" : "s"} ·{" "}
                          <span className="text-muted-foreground font-normal">
                            {t.paymentMethod === "CRYPTO" ? "Crypto" : "Credit card"}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold">
                          {formatPrice(t.amount, t.currency)}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            t.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                              : t.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border-amber-200 text-xs"
                                : "bg-rose-50 text-rose-700 border-rose-200 text-xs"
                          }
                        >
                          {t.status.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
