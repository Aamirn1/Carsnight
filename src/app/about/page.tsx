import Link from "next/link";
import { ShieldCheck, Globe2, Bitcoin, Tag, Sparkles, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Cars Night",
  description: "Cars Night is a global car marketplace on a mission to make buying, selling, and renting cars effortless, secure, and global — with crypto and card payments.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" /> About Us
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight">
          Your global car marketplace, <span className="gradient-text">no gravity needed</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Cars Night exists to make car transactions effortless, secure, and global — whether you&apos;re buying your first car, selling a supercar, or renting a Tesla for the weekend.
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 gap-6">
        {[
          { icon: Globe2, title: "Global by default", text: "Buyers and sellers across 20+ countries, with localized listings tuned to your country." },
          { icon: Bitcoin, title: "Crypto-native", text: "Pay with Bitcoin, Ethereum, or USDT — no bank fees, no chargebacks, instant settlement." },
          { icon: ShieldCheck, title: "Secure by design", text: "OWASP-aligned security, hashed passwords, rate-limited APIs, and audit logs for every admin action." },
          { icon: Tag, title: "Fair pricing", text: "Two free ads for everyone. Upgrade with a one-time Pro Plan purchase from $5. Credits never expire." },
        ].map((f, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <f.icon className="h-5 w-5" />
            </div>
            <h2 className="font-semibold text-lg">{f.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl border bg-gradient-to-br from-primary/10 to-background p-8 text-center">
        <Car className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-2xl font-bold">Join Cars Night today</h2>
        <p className="mt-2 text-muted-foreground">Two free listings, no credit card needed. Reach buyers and renters worldwide.</p>
        <Button asChild className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/signup">Get started free</Link>
        </Button>
      </div>
    </div>
  );
}
