"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, Plus, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

// Main nav links (desktop top bar). Renamed "Pricing" → "Plans" per request.
// Blog / About / Contact live in the burger menu and footer, not the top bar
// (to keep the top bar concise).
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/cars-for-sale", label: "Cars for Sale" },
  { href: "/cars-for-rent", label: "Cars for Rent" },
  { href: "/pricing", label: "Plans" },
];

// Burger-menu links (mobile). Blog / About / Contact added below Cars for Rent.
const BURGER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/cars-for-sale", label: "Cars for Sale" },
  { href: "/cars-for-rent", label: "Cars for Rent" },
  { href: "/pricing", label: "Plans" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  // On non-home pages the navbar is solid from the top. On the home page it
  // starts transparent over the dark hero and becomes solid after scrolling.
  // We initialize based on the pathname so SSR + first paint are correct,
  // then update via the scroll listener (no set-state-in-effect).
  const [scrolled, setScrolled] = useState(pathname !== "/");

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isAuthed = status === "authenticated" && !!session?.user;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // --- Transparent-over-hero behaviour ----------------------------------
  // On the home page, the navbar starts transparent over the dark cinematic
  // hero and becomes solid (with a light background + border + blur) once the
  // user scrolls past the hero. On every other page, the navbar is solid from
  // the top so it always looks correct over light content.
  useEffect(() => {
    if (pathname !== "/") return;
    const compute = () => {
      // The hero section is roughly 100vh tall (sticky). Once the user scrolls
      // past ~70% of the first viewport, we treat the navbar as solid.
      // This is intentionally a little early so the navbar is solid before the
      // hero fully leaves the screen, avoiding any visual gap.
      setScrolled(window.scrollY > window.innerHeight * 0.7);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [pathname]);

  // When the navbar is transparent (over the hero), we use the light brand
  // mark so the wordmark reads in white against the dark video.
  const light = !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
          : "border-b border-transparent bg-transparent backdrop-blur-none",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <BrandMark light={light} />
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  scrolled
                    ? isActive(l.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    : isActive(l.href)
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthed ? (
            <>
              <Button asChild size="sm" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/post-ad">
                  <Plus className="h-4 w-4 mr-1" /> Post Ad
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href={isAdmin ? "/admin" : "/dashboard"}>
                  {isAdmin ? <ShieldCheck className="h-4 w-4 mr-1" /> : <LayoutDashboard className="h-4 w-4 mr-1" />}
                  {isAdmin ? "Admin" : "Dashboard"}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="hidden sm:inline-flex">
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className={cn("hidden sm:inline-flex", !scrolled && "text-white hover:bg-white/10 hover:text-white")}>
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/signup">
                  <Sparkles className="h-4 w-4 mr-1" /> Sign up free
                </Link>
              </Button>
            </>
          )}

          {/* Mobile burger menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("md:hidden", !scrolled && "text-white hover:bg-white/10 hover:text-white")}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" hideClose className="w-[300px] sm:w-[360px] p-0">
              <div className="flex flex-col h-full">
                {/* Header: brand mark only (no X close button — the user
                    taps outside or uses the nav links to navigate). */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <BrandMark size="sm" />
                </div>

                {/* Navigation links (scrollable if long) */}
                <nav className="flex flex-col gap-1 p-4 scrollbar-thin overflow-y-auto" aria-label="Mobile navigation">
                  {BURGER_LINKS.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <Link
                        href={l.href}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive(l.href) ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  {isAuthed ? (
                    <>
                      <SheetClose asChild>
                        <Link href="/post-ad" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted flex items-center">
                          <Plus className="h-4 w-4 mr-2" /> Post Ad
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href={isAdmin ? "/admin" : "/dashboard"} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted flex items-center">
                          {isAdmin ? <ShieldCheck className="h-4 w-4 mr-2" /> : <LayoutDashboard className="h-4 w-4 mr-2" />}
                          {isAdmin ? "Admin Panel" : "Dashboard"}
                        </Link>
                      </SheetClose>
                      <button
                        onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted text-left flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Sign out
                      </button>
                    </>
                  ) : null}
                </nav>

                {/* Auth buttons in a single row at the bottom of the burger
                    menu (only when not signed in). */}
                {!isAuthed && (
                  <div className="mt-auto p-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-2">
                      <SheetClose asChild>
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href="/signin">
                            <UserIcon className="h-4 w-4 mr-1" /> Sign in
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          <Link href="/signup">
                            <Sparkles className="h-4 w-4 mr-1" /> Sign up
                          </Link>
                        </Button>
                      </SheetClose>
                    </div>
                    <p className="mt-3 text-center text-[11px] text-muted-foreground">
                      Cars Night — Your global car marketplace
                    </p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
