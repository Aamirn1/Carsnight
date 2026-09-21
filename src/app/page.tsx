import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { toPublicListing } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listing-card";
import { Typewriter } from "@/components/typewriter";
import { VideoScrollHero } from "@/components/video-scroll-hero";
import {
  Car, ArrowRight, ShieldCheck, Globe2, Bitcoin, Sparkles,
  Tag, TrendingUp, Users, ListChecks, Search, PenLine, CreditCard,
} from "lucide-react";

export const revalidate = 60;
// Allow build to succeed even if DATABASE_URL isn't configured yet — the
// page will be ISR'd with real data once the DB is available at runtime.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch featured listings + counts + public settings.
  // Wrapped in try/catch so the build succeeds even when the database is
  // not yet configured (e.g., first Vercel deploy before env vars are set).
  // At runtime with a configured DB, real data is served via ISR.
  let featured: any[] = [];
  let saleCount = 0;
  let rentCount = 0;
  let userCount = 0;
  let settingsRows: any[] = [];
  try {
    [featured, saleCount, rentCount, userCount, settingsRows] = await Promise.all([
      db.listing.findMany({
        where: { status: "APPROVED", featured: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      db.listing.count({ where: { status: "APPROVED", category: "SALE" } }),
      db.listing.count({ where: { status: "APPROVED", category: "RENT" } }),
      db.user.count(),
      db.setting.findMany({ where: { key: { in: ["site_name", "tagline", "announcement", "contact_email"] } } }),
    ]);
  } catch {
    // DB not available — use fallback values so the page renders.
  }
  const settings: Record<string, string> = {};
  for (const s of settingsRows) settings[s.key] = s.value;
  const tagline = settings.tagline || "Your global car marketplace, no gravity needed!";
  const announcement = settings.announcement || "Crypto payments now accepted — pay with BTC, ETH, or USDT!";

  const featuredListings = featured.map(toPublicListing);

  // JSON-LD for SEO
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cars Night",
    url: "https://carsnight.example.com",
    logo: "https://carsnight.example.com/logo.png",
    description: "Global car marketplace to buy, sell, and rent vehicles with crypto and card payments.",
    sameAs: ["https://twitter.com/carsnight", "https://instagram.com/carsnight"],
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cars Night",
    url: "https://carsnight.example.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://carsnight.example.com/cars-for-sale?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex flex-col">
      {/* Cinematic scroll-controlled video hero. The video timeline is scrubbed
          by the user's scroll position over ~700px (desktop) / ~600px (mobile).
          Single persistent <video> element, no JPG frames, no database.
          The hero is pulled up under the transparent navbar (-mt-16 = -64px,
          the navbar height) so the navbar overlays the top of the dark hero. */}
      <div className="-mt-16">
        <VideoScrollHero
          tagline={tagline}
          announcement={announcement}
          saleCount={saleCount}
          rentCount={rentCount}
          userCount={userCount}
        />
      </div>

      {/* Trust badges */}
      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: "Secure", text: "OWASP best practices, hashed passwords, rate-limited APIs" },
              { icon: Globe2, title: "Global", text: "20+ countries with localized listings & filters" },
              { icon: Bitcoin, title: "Crypto + Card", text: "Pay with BTC, ETH, USDT, or any credit card" },
              { icon: Tag, title: "2 Free Ads", text: "Get started free — upgrade with Pro Plans from $5" },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <b.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{b.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{b.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">Two marketplaces</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Browse by your goal</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Looking to buy or to rent? We surface listings tuned to your country for a faster, more relevant search.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/cars-for-sale" className="group relative overflow-hidden rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-[16/9] sm:aspect-[16/8]">
                <Image src="/cars/porsche-red.png" alt="Cars for sale" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-bold">Find the perfect car to buy</h3>
                <p className="mt-1 text-sm text-white/80 max-w-md">Browse {saleCount.toLocaleString()}+ verified cars for sale worldwide.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-foreground bg-primary rounded-md px-3 py-1.5 w-fit">
                  Buy a car <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
            <Link href="/cars-for-rent" className="group relative overflow-hidden rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="relative aspect-[16/9] sm:aspect-[16/8]">
                <Image src="/cars/lambo-yellow.png" alt="Cars for rent" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <h3 className="text-2xl font-bold">Rent your dream car for special events</h3>
                <p className="mt-1 text-sm text-white/80 max-w-md">From a Tesla weekend to a Lamborghini for the day — {rentCount.toLocaleString()}+ rentals.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-foreground bg-primary rounded-md px-3 py-1.5 w-fit">
                  Rent a car <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {featuredListings.length > 0 && (
        <section className="py-14 sm:py-16 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <Badge variant="outline" className="mb-3 text-primary border-primary/30"><TrendingUp className="h-3 w-3 mr-1" /> Featured</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Trending right now</h2>
                <p className="mt-2 text-muted-foreground">Hand-picked listings our community is loving this week.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/cars-for-sale">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredListings.map((l, i) => (
                <ListingCard key={l.id} listing={l} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">Simple steps</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How Cars Night works</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">List in minutes, browse with smart filters, transact securely.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Search, step: "01", title: "Search & filter", text: "Filter by country, city, price, make, year, fuel, transmission. Localized to your country by default." },
              { icon: PenLine, step: "02", title: "Post your ad", text: "Create a listing with up to 5 photos. Your first 2 ads are free — no credit card needed." },
              { icon: CreditCard, step: "03", title: "Pay your way", text: "Upgrade with card or crypto. Bitcoin, Ethereum, and USDT supported for instant global payments." },
            ].map((s, i) => (
              <div key={i} className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-bold text-muted-foreground/40">{s.step}</span>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 sm:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Car, label: "Listings", value: (saleCount + rentCount).toLocaleString() },
              { icon: Tag, label: "For Sale", value: saleCount.toLocaleString() },
              { icon: Users, label: "Members", value: userCount.toLocaleString() },
              { icon: ListChecks, label: "For Rent", value: rentCount.toLocaleString() },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm">
                <s.icon className="mx-auto h-7 w-7 text-primary" />
                <div className="mt-2 text-3xl font-bold tracking-tight">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-8 sm:p-12 text-center shadow-sm">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">Pro Plans</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Need more than 2 free ads?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Upgrade to a Pro Plan and post more listings for a flat price. Pay with credit card or crypto. No subscriptions, no auto-renew — just credits that never expire.
            </p>
            <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              {[
                { price: "$5", credits: "3 listings", popular: false },
                { price: "$8", credits: "5 listings", popular: true },
                { price: "$10", credits: "10 listings", popular: false },
              ].map((p, i) => (
                <div key={i} className={`rounded-2xl border bg-card p-5 shadow-sm relative ${p.popular ? "border-primary" : ""}`}>
                  {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow">Most popular</span>}
                  <div className="text-3xl font-bold text-primary">{p.price}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{p.credits}</div>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/pricing">See full pricing <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-10 sm:p-16 text-center">
            <div className="absolute inset-0 opacity-20">
              <Image src="/hero-bg.png" alt="" fill sizes="100vw" className="object-cover" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Ready to find your next car?</h2>
              <p className="mt-4 text-background/80 max-w-2xl mx-auto">
                Join Cars Night today, post up to 2 free ads, and reach buyers and renters worldwide.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/signup"><Sparkles className="h-4 w-4 mr-1" /> Get started free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background">
                  <Link href="/cars-for-sale">Browse cars <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
    </div>
  );
}
