import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// GET /api/admin/stats - dashboard stats (admin only)
export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

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

  // Listings by country (top 10)
  const byCountryRaw = await db.listing.groupBy({
    by: ["country"],
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  // Recent transactions (last 10)
  const recentTxns = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { email: true, name: true } } },
  });

  return NextResponse.json({
    counts: {
      users: totalUsers,
      listings: totalListings,
      pending: pendingListings,
      approved: approvedListings,
      rejected: rejectedListings,
      transactions: totalTransactions,
      sale: saleListings,
      rent: rentListings,
    },
    revenue: {
      total: revenueAgg._sum.amount ?? 0,
      currency: "USD",
    },
    byCountry: byCountryRaw.map((c) => ({ country: c.country, count: c._count._all })),
    recentTransactions: recentTxns.map((t) => ({
      id: t.id,
      amount: t.amount,
      currency: t.currency,
      method: t.paymentMethod,
      credits: t.credits,
      status: t.status,
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      user: t.user ? { email: t.user.email, name: t.user.name } : null,
    })),
  });
}
