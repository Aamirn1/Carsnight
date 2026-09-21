# Cars Night — Your Global Car Marketplace

A premium, cinematic car marketplace built with **Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui + Prisma**. Buy, sell, and rent cars worldwide. Two free listings per user, then upgrade with Pro Plans (pay with card or crypto).

![Cars Night](public/car-poster.webp)

## ✨ Features

- **Cinematic scroll-controlled video hero** — the user's scroll scrubs the timeline of a single optimized MP4 (no JPG frame sequence, no database for video delivery). Smooth easing via `requestAnimationFrame` + lerp.
- **Brush-script brand wordmark** — elegant "Cars Night" wordmark with white "Cars" + gold "Night" over the dark hero, dark "Cars" + gold "Night" on the light navbar.
- **Transparent-over-hero navbar** — the navbar is transparent over the cinematic hero and becomes solid (with blur + border) after scrolling past it. Solid from the top on inner pages.
- **Global marketplace** — Cars for Sale + Cars for Rent pages with faceted filters (country, city, make, price, fuel, transmission, body type, sort).
- **Listing detail pages** — image gallery, full specs, seller card, contact dialog, related listings, **Vehicle + BreadcrumbList JSON-LD** for rich SEO.
- **Auth** — email/password sign-in with **NextAuth.js**, math captcha on signup, country/city collection, JWT sessions in HTTP-only cookies. Admin auto-detected by email.
- **User dashboard** — quota cards (free posts used / paid credits), my listings, recent transactions, quick actions.
- **Post Ad** — full form with image upload (up to 5, JPEG/PNG/WEBP, magic-number validation), live preview, validation, free/paid quota enforcement.
- **Pricing** — 3 Pro Plans ($5/3, $8/5, $10/10) with card + crypto checkout dialog (BTC/ETH/USDT demo wallets).
- **Admin Panel** — `/admin/*` with stats, listings moderation (approve/reject/feature/delete), user management (ban/role/credits), site settings. Role-based access control, audit logs.
- **Security** — OWASP-aligned: bcrypt password hashing, rate limiting on all APIs, strict input validation, parameterized queries, CSRF-safe cookies, audit logs, no secrets in client code.
- **SEO** — `sitemap.xml` (dynamic, includes all approved listings), `robots.txt`, `manifest.webmanifest`, per-page metadata, canonical URLs, OpenGraph + Twitter cards, JSON-LD (Organization, WebSite, Vehicle, BreadcrumbList, FAQPage, ItemList).
- **Content pages** — Blog (featured + 5 posts + newsletter), About (mission + timeline + differentiation), Contact (form + info cards + social), FAQ, Privacy, Terms.
- **Responsive** — mobile-first, sticky footer, scroll-to-top on route change, dark mode toggle.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York) + lucide-react icons
- **Database**: Prisma ORM with SQLite (regenerate via `bun run db:push && bun run scripts/seed.ts`)
- **Auth**: NextAuth.js v4 (Credentials provider, JWT sessions)
- **State**: React hooks + refs (no per-scroll re-renders on the hero)
- **Fonts**: Geist (body) + Outfit + Playfair Display (display) via `next/font/google`
- **Animations**: Framer Motion available; CSS keyframes for hero float + typewriter caret

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or [Bun](https://bun.sh)
- A GitHub PAT (if you want to clone via HTTPS)

### Install
```bash
bun install   # or npm install
```

### Environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
# Generate a NEXTAUTH_SECRET:
openssl rand -base64 32
```

```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
NEXTAUTH_SECRET=<your-generated-secret>
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=amir03115794492@gmail.com
```

### Database
```bash
bun run db:push       # create the SQLite schema
bun run scripts/seed.ts   # seed admin, demo user, sellers, listings, plans, settings
```

### Run
```bash
bun run dev   # http://localhost:3000
```

### Demo accounts
- **Admin**: `amir03115794492@gmail.com` / `@#$&16609` → redirects to `/admin`
- **Demo user**: `demo@carsnight.com` / `demo1234` → redirects to `/dashboard`

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home (cinematic video hero + featured listings)
│   ├── layout.tsx            # Root layout (providers, header, footer, SEO)
│   ├── cars-for-sale/        # Sale listings with filters
│   ├── cars-for-rent/        # Rent listings with filters
│   ├── listing/[slug]/       # Listing detail (SEO + JSON-LD)
│   ├── blog/ about/ contact/ # Content pages
│   ├── pricing/              # Subscription plans + checkout
│   ├── signin/ signup/       # Auth
│   ├── dashboard/ post-ad/   # User area
│   ├── admin/                # Admin panel (RBAC)
│   └── api/                  # 11 API endpoints (listings, auth, admin, upload, ...)
├── components/
│   ├── video-scroll-hero.tsx # Scroll-controlled MP4 hero
│   ├── brand-mark.tsx        # Brush-script wordmark
│   ├── site-header.tsx       # Transparent-over-hero navbar
│   ├── site-footer.tsx
│   ├── listing-card.tsx, listing-filters.tsx, listing-gallery.tsx
│   ├── image-upload.tsx, country-city-select.tsx
│   └── ui/                   # shadcn/ui components
└── lib/
    ├── auth.ts               # NextAuth config
    ├── session.ts            # getSessionUser, requireAdmin, getUserQuota
    ├── constants.ts           # COUNTRIES, FUEL_TYPES, validation helpers
    ├── db.ts                 # Prisma client
    └── rate-limit.ts          # In-memory rate limiter

prisma/schema.prisma          # User, Listing, Plan, Transaction, Setting, AuditLog
public/videos/                # Optimized MP4s (all-keyframe, faststart)
public/brand-wordmark-*.png   # Brush-script wordmark (light + dark variants)
public/car-poster*.webp       # Video poster frames
scripts/seed.ts              # Seed script
```

## 🔐 Security

- **Passwords**: bcrypt-hashed (10 rounds)
- **Sessions**: JWT in HTTP-only cookies (NextAuth), 30-day expiry
- **Rate limiting**: in-memory, per-IP (auth: 10/min, listing-create: 20/min, upload: 30/min, general: 120/min)
- **Input validation**: server-side schema checks on every API (type, length, format, allowed values)
- **File uploads**: JPEG/PNG/WEBP only, max 5MB, magic-number validation, unique content-hash filenames, stored outside the executable path
- **Admin access**: every `/admin/*` page + API enforces `user.role === "ADMIN"` server-side (defense in depth)
- **Audit logs**: login success/failure, listing create/edit/delete, plan purchase, admin moderation, settings update
- **No secrets in client**: all secrets in env vars; the token used to push this repo is not stored anywhere in the codebase

## 🎨 Design

- **Light palette**: white/near-white background, vibrant **gold** (#C98216) primary, deep ink-navy text
- **Golden gradient buttons**: `linear-gradient(135deg, #F5B82E 0%, #C98216 100%)` with a lighter hover gradient `linear-gradient(135deg, #FFD15A 0%, #F5B82E 100%)`
- **Brush-script wordmark**: extracted and recolored from a reference image; two variants for dark/light backgrounds
- **3D accents**: floating glassmorphism badges, card tilt on hover, parallax hero background
- **Mobile-first**: sticky header (transparent over hero), sticky footer, scroll-to-top on navigation

## 📦 Deployment

Optimized for **Vercel**:
1. Push to GitHub (this repo)
2. Import into Vercel
3. Set env vars in Vercel dashboard (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`)
4. Vercel auto-deploys on every push to `main`

> Note: for production, swap SQLite for a real database (PostgreSQL/MySQL) by changing the `provider` in `prisma/schema.prisma` and updating `DATABASE_URL`.

## 📄 License

MIT © Cars Night
