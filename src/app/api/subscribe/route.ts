import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/subscribe - purchase a subscription plan (simulated payment, supports CARD | CRYPTO)
export async function POST(req: Request) {
  const key = `subscribe:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.listingCreate, 60_000);
  if (!rl.ok) return rateLimitResponse();

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "You must be signed in to purchase a plan." }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const planId = String(body.planId ?? "");
  const method = String(body.method ?? "CARD").toUpperCase();
  if (!["CARD", "CRYPTO"].includes(method)) {
    return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
  }

  const plan = await db.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.active) {
    return NextResponse.json({ error: "Selected plan is not available." }, { status: 400 });
  }

  // Simulate payment processing (production: integrate Stripe / Coinbase Commerce)
  // For demo: instantly credit the user's account with listing credits.
  const txn = await db.transaction.create({
    data: {
      userId: user.id,
      planId: plan.id,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod: method,
      cryptoWallet: method === "CRYPTO" ? (body.cryptoWallet || "demo-wallet") : null,
      status: "COMPLETED",
      credits: plan.credits,
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { listingCredits: { increment: plan.credits } },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "PLAN_PURCHASE",
      details: `${plan.name} (${method}) - ${plan.credits} credits`,
    },
  }).catch(() => null);

  return NextResponse.json({
    ok: true,
    transaction: {
      id: txn.id,
      amount: txn.amount,
      currency: txn.currency,
      method: txn.paymentMethod,
      credits: txn.credits,
      status: txn.status,
    },
    creditsAdded: plan.credits,
    message: `Payment complete! ${plan.credits} listing credits added to your account.`,
  });
}
