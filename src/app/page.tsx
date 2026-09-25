import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { toPublicListing } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listing-card";
import { Typewriter } from "@/components/typewriter";
import { ImageHero } from "@/components/image-hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ContactFormSection } from "@/components/contact-form-section";
import {
  Car, ArrowRight, ShieldCheck, Globe2, Bitcoin, Sparkles,
  Tag, TrendingUp, Users, ListChecks, Search, PenLine, CreditCard, Crown, HelpCircle,
  Target, Heart, Rocket,
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
  const announcement = settings.announcement || "Buy your dream car — or rent one for your next special event";

  const featuredListings = featured.map(toPublicListing);

  // JSON-LD for SEO
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cars Night",
    url: "https://carsnight1.vercel.app",
    logo: "https://carsnight1.vercel.app/logo.png",
    description: "Global car marketplace to buy, sell, and rent vehicles with crypto and card payments.",
    sameAs: ["https://twitter.com/carsnight", "https://instagram.com/carsnight"],
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cars Night",
    url: "https://carsnight1.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://carsnight1.vercel.app/cars-for-sale?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="flex flex-col">
      {/* Static image hero — full-bleed high-quality image background (no
          video, no canvas, no scroll-scrubbing). The hero is exactly 100vh
          tall. The navbar stays transparent over it and becomes solid when
          the user scrolls past it. The image is shown at original quality
          with NO dark overlay/shade.
          -mt-16 pulls the hero up under the transparent navbar (which is
          h-16 = 64px tall) so the image fills the full viewport behind it. */}
      <div className="-mt-16">
        <ImageHero
          tagline={tagline}
          announcement={announcement}
          saleCount={saleCount}
          rentCount={rentCount}
          userCount={userCount}
        />
      </div>

      {/* Trust badges — descriptions hidden on mobile (only titles + icons
          show) so the 4 badges fit cleanly without truncation. */}
      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: "Secure", text: "OWASP best practices, hashed passwords, rate-limited APIs" },
              { icon: Globe2, title: "Global", text: "20+ countries with localized listings & filters" },
              { icon: Car, title: "Premium Ride", text: "Curated luxury and sports cars from verified sellers" },
              { icon: Crown, title: "Luxury Brands", text: "Porsche, Lamborghini, BMW, Mercedes and more" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <b.icon className="h-4 w-4 icon-neon" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm">{b.title}</div>
                  {/* Description hidden on mobile (line-clamp + hidden sm:block)
                      so the 4 badges fit cleanly without truncation. */}
                  <div className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">{b.text}</div>
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
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white rounded-md px-3 py-1.5 w-fit" style={{ backgroundImage: "linear-gradient(135deg, #00A8FF 0%, #6366F1 40%, #8B5CF6 70%, #D946EF 100%)" }}>
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
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white rounded-md px-3 py-1.5 w-fit" style={{ backgroundImage: "linear-gradient(135deg, #00A8FF 0%, #6366F1 40%, #8B5CF6 70%, #D946EF 100%)" }}>
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
                    <s.icon className="h-5 w-5 icon-neon" />
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
                <s.icon className="mx-auto h-7 w-7 icon-neon" />
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
                <div key={i} className={`rounded-2xl border bg-card p-5 shadow-sm relative ${p.popular ? "border-primary ring-2 ring-primary/30" : ""}`}>
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge style={{ backgroundImage: "linear-gradient(135deg, #00A8FF 0%, #6366F1 40%, #8B5CF6 70%, #D946EF 100%)" }} className="text-white border-transparent shadow-md">
                        <Crown className="h-3 w-3 mr-1" /> Most popular
                      </Badge>
                    </div>
                  )}
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

      {/* About Us section — same content as the About page, below Pro Plans */}
      <section className="border-y bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "20+", label: "Countries" },
              { value: "14+", label: "Active listings" },
              { value: "5+", label: "Verified sellers" },
              { value: "100%", label: "Secure payments" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30"><Target className="h-3 w-3 mr-1" /> Our Mission</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">A car marketplace that respects your time, money, and trust</h2>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            {[
              { icon: Globe2, title: "Global by default", text: "Buyers and sellers across 20+ countries, with localized listings tuned to your country and city." },
              { icon: Bitcoin, title: "Crypto-native", text: "Pay with Bitcoin, Ethereum, or USDT — no bank fees, no chargebacks, instant settlement worldwide." },
              { icon: ShieldCheck, title: "Secure by design", text: "OWASP-aligned security, hashed passwords, rate-limited APIs, and audit logs for every admin action." },
              { icon: Tag, title: "Fair pricing", text: "Two free ads for everyone. Upgrade with a one-time Pro Plan purchase from $5. Credits never expire." },
            ].map((v, i) => (
              <div key={i} className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{v.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-card/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30"><Rocket className="h-3 w-3 mr-1" /> Our Story</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From a simple idea to a global marketplace</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-10">
              {[
                { year: "2025", title: "The idea", text: "Cars Night was born from a simple frustration: buying a car online was fragmented, unsafe, and deeply local. We set out to fix that." },
                { year: "2026", title: "Launch", text: "We opened to early users in 5 countries — the US, UK, Pakistan, Japan, and the UAE — with crypto payments from day one." },
                { year: "2026+", title: "Where we're going", text: "Expanding to 50+ countries, AI-powered vehicle inspections, virtual test drives, and a mobile app — all while keeping the experience premium and human." },
              ].map((t, i) => (
                <div key={i} className={`relative flex sm:items-center ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                  <div className="hidden sm:block sm:w-1/2" />
                  <div className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-10 sm:top-1/2 sm:-translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10" />
                  <div className={`pl-12 sm:pl-0 sm:w-1/2 sm:px-8 ${i % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}>
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                      <div className="text-2xl font-bold text-primary">{t.year}</div>
                      <h3 className="mt-1 font-semibold text-lg">{t.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-3 text-primary border-primary/30"><Heart className="h-3 w-3 mr-1" /> What Makes Us Different</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for car people, by car people</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            We&apos;re a small, obsessive team of car enthusiasts and engineers. We&apos;ve bought cars the painful way — and we&apos;re building the marketplace we wish existed. Every decision starts with a simple question: would we use this ourselves?
          </p>
          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-left">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">Humans, not bots</h3>
              <p className="mt-1 text-sm text-muted-foreground">Every listing is reviewed by a real person. No spam, no fake dealers, no AI-generated inventory.</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <Car className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">Cars first</h3>
              <p className="mt-1 text-sm text-muted-foreground">The car is the hero. Our cinematic hero, large listing photos, and minimal UI keep the spotlight where it belongs.</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">Security is a feature</h3>
              <p className="mt-1 text-sm text-muted-foreground">Hashed passwords, rate limits, audit logs, crypto escrow. We invest in security so you don&apos;t have to worry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact section — same form as the Contact page, below About Us */}
      <ContactFormSection />

      {/* About / Contact / FAQs section — redesigned as a section (not cards)
          with an Accordion FAQ, matching the Plans page FAQ design. */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3 text-primary border-primary/30"><HelpCircle className="h-3 w-3 mr-1" /> About · Contact · FAQs</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Learn more about Cars Night</h2>
            <p className="mt-2 text-sm text-muted-foreground">Everything you need to know about our marketplace, team, and how to get help.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="about">
              <AccordionTrigger>What is Cars Night?</AccordionTrigger>
              <AccordionContent>
                Cars Night is a global car marketplace for buying, selling, and renting vehicles.
                We connect buyers, sellers, and renters across 20+ countries with a secure,
                SEO-optimized platform. Post up to 2 free ads, upgrade with Pro Plans from $5,
                and pay with credit card or crypto.{" "}
                <Link href="/about" className="text-primary hover:underline font-medium">Learn more about us →</Link>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="mission">
              <AccordionTrigger>What&apos;s your mission?</AccordionTrigger>
              <AccordionContent>
                We exist to make car transactions effortless, secure, and global — whether you&apos;re
                buying your first car, selling a supercar, or renting a Tesla for the weekend. We
                believe in fair pricing, crypto-native payments, and a human-first marketplace.{" "}
                <Link href="/about" className="text-primary hover:underline font-medium">Read our story →</Link>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="contact">
              <AccordionTrigger>How do I contact support?</AccordionTrigger>
              <AccordionContent>
                Email us at <Link href="mailto:support@carsnight.com" className="text-primary hover:underline font-medium">support@carsnight.com</Link>{" "}
                — we typically reply within one business day. For urgent payment issues, you can also
                call +1 (555) 016-2026 (Mon–Fri, 9am–6pm UTC).{" "}
                <Link href="/contact" className="text-primary hover:underline font-medium">Get in touch →</Link>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="free">
              <AccordionTrigger>How many free listings do I get?</AccordionTrigger>
              <AccordionContent>
                Every user gets 2 free listings to start. They can be used for cars for sale or for rent.
                When you run out, you can purchase a Pro Plan for more credits. Credits never expire.{" "}
                <Link href="/pricing" className="text-primary hover:underline font-medium">See plans →</Link>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="payments">
              <AccordionTrigger>Which payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept credit/debit cards (Visa, Mastercard) and cryptocurrency: Bitcoin (BTC),
                Ethereum (ETH), and Tether (USDT). Both options are processed instantly and credits
                appear in your dashboard right away.{" "}
                <Link href="/pricing" className="text-primary hover:underline font-medium">See plans →</Link>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="security">
              <AccordionTrigger>Is the platform secure?</AccordionTrigger>
              <AccordionContent>
                Yes. We follow OWASP best practices: hashed passwords (bcrypt), HTTP-only session cookies,
                rate-limited APIs, strict input validation, parameterized queries, and audit logs for
                every admin action. We never store credit card numbers or private keys.{" "}
                <Link href="/about" className="text-primary hover:underline font-medium">Learn more →</Link>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="more-faqs">
              <AccordionTrigger>Where can I find more FAQs?</AccordionTrigger>
              <AccordionContent>
                For the full FAQ list — including how listings work, crypto payment details, refunds,
                and account management — visit our dedicated FAQ page.{" "}
                <Link href="/faq" className="text-primary hover:underline font-medium">Read all FAQs →</Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA — moved to just above the footer (end of page) */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-10 sm:p-16 text-center">
            <div className="absolute inset-0 opacity-40">
              <Image src="/hero-cars.png" alt="" fill sizes="100vw" className="object-cover" />
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
