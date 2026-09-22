import Link from "next/link";
import {
  Check,
  Crown,
  Coins,
  Tag,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Bitcoin,
  CreditCard,
  Wallet,
} from "lucide-react";
import { db } from "@/lib/db";
import { getSessionUser, getUserQuota } from "@/lib/session";
import { formatPrice, FREE_LISTING_LIMIT } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlanBuyButton } from "@/components/plan-buy-button";

// Feature list per plan — based on PRD: credits never expire, use for sale or rent, higher tiers add priority support
const PLAN_FEATURES: Record<string, string[]> = {
  Starter: ["3 listing credits", "Use for sale or rent", "Credits never expire", "Email support"],
  Pro: ["5 listing credits", "Use for sale or rent", "Credits never expire", "Priority support", "Featured listing badge"],
  Business: ["10 listing credits", "Use for sale or rent", "Credits never expire", "Priority support", "Featured listing badge", "Dedicated account manager"],
};

function featuresFor(name: string): string[] {
  return PLAN_FEATURES[name] ?? ["Listing credits", "Use for sale or rent", "Credits never expire"];
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Plans — Buy Listing Credits | Cars Night",
  description: "Upgrade to a Pro Plan and post more car listings. Credits never expire. Pay with credit card or crypto (BTC, ETH, USDT). Plans from $5.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const user = await getSessionUser();
  let quota: { freeRemaining: number; paidRemaining: number; total: number } | null = null;
  if (user) {
    try {
      const q = await getUserQuota(user.id);
      quota = { freeRemaining: q.freeRemaining, paidRemaining: q.paidRemaining, total: q.total };
    } catch {
      // DB not available — skip quota display.
    }
  }

  let plans: any[] = [];
  try {
    plans = await db.plan.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    });
  } catch {
    // DB not available — fall back to static plan definitions.
    plans = [
      { id: "fallback-starter", name: "Starter", price: 5, currency: "USD", credits: 3, description: "3 extra listings" },
      { id: "fallback-pro", name: "Pro", price: 8, currency: "USD", credits: 5, description: "5 extra listings" },
      { id: "fallback-business", name: "Business", price: 10, currency: "USD", credits: 10, description: "10 extra listings" },
    ];
  }

  // Highlight the Pro plan (middle / "Most popular")
  const popularName = "Pro";

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Sparkles className="h-3 w-3 mr-1" /> Pricing
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Buy listing credits — <span className="gradient-text">never expire</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Every user gets <strong className="text-foreground">{FREE_LISTING_LIMIT} free listings</strong> to start.
            Buy credits when you need more. Credits never expire.
          </p>

          {/* Current quota */}
          {user && quota ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
              <Wallet className="h-4 w-4 text-primary" />
              <span>
                You have <strong className="text-foreground">{quota.freeRemaining}</strong> free +{" "}
                <strong className="text-foreground">{quota.paidRemaining}</strong> paid credits
              </span>
            </div>
          ) : (
            <div className="mt-6">
              <Button asChild>
                <Link href="/signin?callbackUrl=/pricing">Sign in to buy credits</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Plan cards */}
        <section>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => {
              const isPopular = plan.name === popularName;
              const features = featuresFor(plan.name);
              return (
                <Card
                  key={plan.id}
                  className={`relative shadow-sm flex flex-col ${
                    isPopular
                      ? "border-primary ring-2 ring-primary/30 md:scale-105"
                      : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-md">
                        <Crown className="h-3 w-3 mr-1" /> Most popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.description && (
                      <CardDescription className="text-xs">{plan.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-primary">
                          {formatPrice(plan.price, plan.currency || "USD")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        <Coins className="h-3.5 w-3.5" />
                        {plan.credits} listing credits
                      </p>
                    </div>

                    <Separator className="my-4" />

                    <ul className="space-y-2.5 text-sm flex-1">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6">
                      <PlanBuyButton plan={plan} signedIn={!!user} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {plans.length === 0 && (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="py-12 text-center text-muted-foreground">
                No plans available right now. Please check back later.
              </CardContent>
            </Card>
          )}
        </section>

        {/* Payment methods */}
        <section className="rounded-xl border bg-card p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Pay your way
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose between credit card and crypto. Both are processed instantly and your credits
                appear in your dashboard right away.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-medium">Credit Card</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard (demo)</p>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 flex items-center gap-3">
                <Bitcoin className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-medium">Crypto</p>
                  <p className="text-xs text-muted-foreground">BTC, ETH, USDT</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-3">
              <HelpCircle className="h-3 w-3 mr-1" /> FAQ
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Everything you need to know about credits and payments.
            </p>
          </div>
          <Card className="shadow-sm">
            <CardContent className="pt-2">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what">
                  <AccordionTrigger>What is a listing credit?</AccordionTrigger>
                  <AccordionContent>
                    A listing credit lets you publish one ad on Cars Night — for sale or for rent.
                    Every new user gets <strong>{FREE_LISTING_LIMIT} free listings</strong> to start.
                    After that, you buy credits in packs. Each credit never expires, so you can use
                    it whenever you&apos;re ready to sell or rent.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="expire">
                  <AccordionTrigger>Do credits expire?</AccordionTrigger>
                  <AccordionContent>
                    No. Credits you buy on Cars Night never expire. Use them today, next month, or
                    next year — they&apos;re yours to keep.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="methods">
                  <AccordionTrigger>Which payment methods can I use?</AccordionTrigger>
                  <AccordionContent>
                    You can pay with any major credit card (Visa, Mastercard) or with crypto:
                    Bitcoin (BTC), Ethereum (ETH), or Tether (USDT). Both options are processed
                    instantly and credits appear in your dashboard right away.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="refund">
                  <AccordionTrigger>Can I get a refund?</AccordionTrigger>
                  <AccordionContent>
                    Credit card payments may be eligible for a refund within 14 days if you
                    haven&apos;t used any of the purchased credits — just contact our support team.
                    Crypto payments are <strong>final and cannot be refunded</strong> — blockchain
                    transactions are irreversible (no chargebacks). Please double-check the amount
                    and address before sending.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="safe">
                  <AccordionTrigger>Is crypto safe?</AccordionTrigger>
                  <AccordionContent>
                    Crypto is safe as long as you send the exact amount to the correct address.
                    Always copy the address from your checkout screen — never type it by hand.
                    Keep in mind that crypto payments are final: once the transaction is confirmed
                    on the blockchain, it cannot be reversed. We recommend using a wallet you
                    control (not an exchange) for the smoothest experience.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="rounded-xl bg-primary text-primary-foreground p-6 sm:p-10 text-center">
          <ShieldCheck className="h-8 w-8 mx-auto mb-3" />
          <h2 className="text-2xl font-bold">Ready to sell or rent your car?</h2>
          <p className="text-sm opacity-90 mt-1">
            Post your first ad in minutes. 2 free listings included — no credit card required.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <Button asChild variant="secondary">
              <Link href="/post-ad">
                <Tag className="h-4 w-4" /> Post an ad
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link href="/cars-for-sale">Browse cars</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
