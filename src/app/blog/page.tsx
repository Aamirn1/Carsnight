import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, TrendingUp, BookOpen, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Cars Night Insider",
  description: "Expert guides on buying, selling, and renting cars. Market trends, vehicle reviews, crypto payments, and marketplace insider tips from the Cars Night team.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Cars Night Blog — Insider Guides & Market Trends",
    description: "Expert guides on buying, selling, and renting cars worldwide.",
    type: "website",
  },
};

// Static blog posts (in production these would come from a CMS/DB).
const POSTS = [
  {
    slug: "how-to-buy-a-used-car-online-safely",
    title: "How to Buy a Used Car Online Safely in 2026",
    excerpt: "From vehicle history reports to in-person inspections — a step-by-step guide to buying a used car online without getting burned. We cover red flags, escrow services, and the paperwork you need to ask for.",
    category: "Buying Guide",
    author: "Cars Night Team",
    date: "2026-09-12",
    readTime: "8 min read",
    image: "/cars/porsche-red.png",
    featured: true,
  },
  {
    slug: "rent-a-lamborghini-for-your-wedding",
    title: "Rent a Lamborghini for Your Wedding: The Ultimate Guide",
    excerpt: "Why arrive in a sedan when you can arrive in a Huracán? A complete guide to renting a supercar for your special day — what to expect, what it costs, and how to book with confidence.",
    category: "Rentals",
    author: "Sofia Ahmed",
    date: "2026-09-05",
    readTime: "6 min read",
    image: "/cars/lambo-yellow.png",
    featured: false,
  },
  {
    slug: "crypto-payments-for-cars-explained",
    title: "Crypto Payments for Cars Explained: BTC, ETH, and USDT",
    excerpt: "Why paying for a car with cryptocurrency is faster, cheaper, and safer than you think. We break down how crypto escrow works, the tax implications, and which coins we accept.",
    category: "Payments",
    author: "Cars Night Team",
    date: "2026-08-28",
    readTime: "7 min read",
    image: "/cars/tesla-white.png",
    featured: false,
  },
  {
    slug: "selling-your-car-photos-that-sell",
    title: "Selling Your Car? 5 Photos That Close the Deal",
    excerpt: "The right photos can sell your car 3× faster. Here are the 5 shots every listing needs — and the common mistakes that make buyers scroll past your ad.",
    category: "Selling Tips",
    author: "Mike Robertson",
    date: "2026-08-20",
    readTime: "5 min read",
    image: "/cars/mercedes-black.png",
    featured: false,
  },
  {
    slug: "electric-vehicles-2026-buyers-guide",
    title: "Electric Vehicles in 2026: A No-Nonsense Buyer's Guide",
    excerpt: "Range anxiety is a thing of the past. We compare the best EVs under $50k, charging infrastructure, and whether an electric car actually saves you money in 2026.",
    category: "Buying Guide",
    author: "Aisha Khan",
    date: "2026-08-15",
    readTime: "10 min read",
    image: "/cars/tesla-white.png",
    featured: false,
  },
  {
    slug: "renting-vs-leasing-vs-buying",
    title: "Renting vs. Leasing vs. Buying: Which Makes Sense for You?",
    excerpt: "The math isn't obvious. We walk through the real cost of ownership for three popular cars over 3 years — so you can pick the right option for your lifestyle and wallet.",
    category: "Market Insights",
    author: "Cars Night Team",
    date: "2026-08-08",
    readTime: "9 min read",
    image: "/cars/bmw-silver.png",
    featured: false,
  },
];

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function BlogPage() {
  const featured = POSTS.find((p) => p.featured) ?? POSTS[0];
  const rest = POSTS.filter((p) => p.slug !== featured.slug);
  const categories = Array.from(new Set(POSTS.map((p) => p.category)));

  return (
    <div className="flex flex-col">
      {/* Hero — centered, light gradient, matching Plans/Buy/Rent pages */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-4">
            <BookOpen className="h-3 w-3 mr-1" /> Blog
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            Insider guides, market trends & <span className="gradient-text">car reviews</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert advice on buying, selling, renting, and paying for cars worldwide. New articles every week.
          </p>
        </div>
      </section>

      {/* Category pills */}
      <div className="border-b bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topics:</span>
            <Badge variant="secondary" className="cursor-default">All</Badge>
            {categories.map((c) => (
              <Badge key={c} variant="outline" className="text-foreground/70">{c}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Featured post */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Featured Article</h2>
          </div>
          <Link href={`/blog/${featured.slug}`} className="group block">
            <article className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-xl">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary text-primary-foreground shadow">Featured</Badge>
                </div>
              </div>
              <div>
                <Badge variant="outline" className="text-primary border-primary/30 mb-4">{featured.category}</Badge>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {featured.title}
                </h3>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(featured.date)}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {featured.readTime}</span>
                  <span>by <strong className="font-medium text-foreground">{featured.author}</strong></span>
                </div>
                <div className="mt-6">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    Read full article <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </div>
      </section>

      {/* Latest posts grid */}
      <section id="latest" className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">Latest articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block h-full">
                <article className="h-full rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <Badge variant="outline" className="text-primary border-primary/30 mb-3">{post.category}</Badge>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(post.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border bg-foreground p-8 sm:p-12 text-center text-background">
            <Mail className="mx-auto h-8 w-8 icon-neon" />
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">Get the best of Cars Night in your inbox</h2>
            <p className="mt-2 text-background/75 max-w-xl mx-auto">
              Join 12,000+ car enthusiasts. Weekly market insights, new listings, and exclusive deals. No spam, ever.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="you@example.com"
                aria-label="Email address"
                className="flex-1 rounded-md bg-background/10 border border-background/30 px-4 py-2.5 text-sm text-background placeholder:text-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="lg" className="btn-gold">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
