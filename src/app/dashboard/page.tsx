import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ListChecks, Coins, Car, CreditCard, Plus, Wallet, ShieldCheck, ArrowRight, Sparkles, Tag,
} from "lucide-react";
import { getSessionUser, getUserQuota, FREE_SALE_LIMIT, FREE_RENT_LIMIT } from "@/lib/session";
import { formatPrice, type PublicListing } from "@/lib/constants";
import { findListings, findTransactions, getUserById, sbListingToPublic } from "@/lib/sb";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MyListings } from "@/components/my-listings";

export const dynamic = "force-dynamic";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  let user;
  try {
    user = await getSessionUser();
  } catch {
    redirect("/signin?callbackUrl=/dashboard");
  }
  if (!user) redirect("/signin?callbackUrl=/dashboard");

  // Fetch all data with try/catch so missing Supabase data doesn't crash
  let quota: any = {
    freeRemaining: 0, paidRemaining: 0, total: 0, freeUsed: 0, freeLimit: 4,
    freeSaleRemaining: FREE_SALE_LIMIT, freeRentRemaining: FREE_RENT_LIMIT,
    freeSaleUsed: 0, freeRentUsed: 0, freeSaleLimit: FREE_SALE_LIMIT, freeRentLimit: FREE_RENT_LIMIT,
  };
  let listings: PublicListing[] = [];
  let transactions: any[] = [];
  let dbUser: any = null;

  try {
    quota = await getUserQuota(user.id);
  } catch {}

  try {
    const sbListings = await findListings({ userId: user.id, orderBy: "createdAt_desc" });
    listings = sbListings.map(sbListingToPublic);
  } catch {}

  try {
    transactions = await findTransactions(user.id, 10);
  } catch {}

  try {
    dbUser = await getUserById(user.id);
  } catch {}

  const totalSpent = transactions
    .filter((t: any) => t.status === "COMPLETED")
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  const totalFreeLimit = FREE_SALE_LIMIT + FREE_RENT_LIMIT;
  const freeUsedPct = Math.min(100, ((quota.freeUsed ?? 0) / totalFreeLimit) * 100);
  const quotaLow = quota.total === 0;
  const initials = (user.name || user.email).trim().slice(0, 1).toUpperCase();
  const isAdmin = user.role === "ADMIN";
  const createdAtStr = dbUser?.createdAt || new Date().toISOString();
  const displayName = user.name || user.email.split("@")[0];

  return (
    <div className="w-full">
      {isAdmin && (
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            You are signed in as admin.
            <Link href="/admin" className="underline hover:no-underline">Visit the Admin Panel →</Link>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome header — name + profile icon on the same row */}
        <div className="flex items-center gap-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base text-muted-foreground font-medium">Welcome back,</span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{displayName}</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Member since {formatDate(createdAtStr)}</p>
          </div>
        </div>

        {/* Quota cards — per-category free + paid credits */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> Free Sale posts</CardDescription></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{quota.freeSaleUsed ?? 0} / {FREE_SALE_LIMIT}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Car className="h-3.5 w-3.5" /> Free Rent posts</CardDescription></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{quota.freeRentUsed ?? 0} / {FREE_RENT_LIMIT}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Paid credits</CardDescription></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{quota.paidRemaining ?? 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription>Total listings</CardDescription></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{listings.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quota progress */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium text-muted-foreground">Total free posts used</span>
              <span className="font-semibold">{quota.freeUsed ?? 0} / {totalFreeLimit}</span>
            </div>
            <Progress value={freeUsedPct} className="h-2" />
          </CardContent>
        </Card>

        {/* Quota warning */}
        {quotaLow && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">You&apos;ve used all your free listings</p>
                  <p className="text-xs text-muted-foreground mt-1">Buy credits to post more ads — credits never expire.</p>
                  <Button asChild size="sm" className="mt-3 btn-gold">
                    <Link href="/pricing">Buy credits <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild className="btn-gold">
            <Link href="/post-ad"><Plus className="h-4 w-4 mr-1.5" /> Post new ad</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">Buy credits</Link>
          </Button>
        </div>

        {/* My listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My listings</h2>
          </div>
          <MyListings listings={listings} />
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent transactions</h2>
          {transactions.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</CardContent></Card>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
                <div>Date</div><div>Plan</div><div className="text-right">Amount</div><div>Method</div>
              </div>
              {transactions.map((t: any) => (
                <div key={t.id} className="grid grid-cols-4 gap-4 px-4 py-3 text-sm border-t">
                  <div className="text-muted-foreground">{formatDate(t.createdAt)}</div>
                  <div>{t.credits} credits</div>
                  <div className="text-right font-medium">{formatPrice(t.amount, t.currency)}</div>
                  <div>{t.paymentMethod}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
