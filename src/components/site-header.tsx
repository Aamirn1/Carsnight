"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, X, Plus, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

// Main nav links (desktop top bar + burger menu). "Buy Car" → "Buy",
// "Rent Car" → "Rent" (word "Car" removed per user request).
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/cars-for-sale", label: "Buy" },
  { href: "/cars-for-rent", label: "Rent" },
  { href: "/pricing", label: "Plans" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Burger-menu links (mobile) — same set as desktop.
const BURGER_LINKS = NAV_LINKS;

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { resolvedTheme } = useTheme();
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
  // On the home page, the navbar stays TRANSPARENT over the full-viewport
  // image hero (100vh tall) and becomes solid (with a light background +
  // border + blur) when the user scrolls past the hero into the first
  // content section ("Browse by your goal"). On every other page, the
  // navbar is solid from the top.
  useEffect(() => {
    if (pathname !== "/") return;
    const compute = () => {
      // The hero is exactly 100vh tall. We flip the navbar to solid 50px
      // before the hero ends so it transitions in just as the first content
      // section scrolls into view.
      const heroTrigger = window.innerHeight - 50;
      setScrolled(window.scrollY > heroTrigger);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [pathname]);

  // --- Light-mode logic (point 6) ---------------------------------------
  // The hero image is dark (sunset + cars). So when the navbar is TRANSPARENT
  // over the hero, both the logo text and the theme-toggle icon should be
  // WHITE so they read against the dark hero — but ONLY in dark mode.
  // Wait — the user said: "in light mode it must be white when transparent
  // background appear then it should convert to black, same for logo text
  // car color it should become white when transparent navbar appear in dark
  // mode only".
  //
  // Interpretation:
  //  - LIGHT mode: theme icon + logo "Cars" text are WHITE when navbar is
  //    transparent (over the dark hero), and BLACK when navbar is solid
  //    (light bg). This is the default behavior since the hero is always dark.
  //  - DARK mode: the user wants the logo text to become WHITE when the
  //    navbar is transparent. In dark mode the solid navbar has a dark bg
  //    so the logo should stay white there too — meaning in dark mode the
  //    logo is ALWAYS white. Only in light mode does it flip.
  //
  // So: `light` (use white wordmark) = transparent navbar OR dark mode.
  const isDark = resolvedTheme === "dark";
  const light = !scrolled || isDark;

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
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap",
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
          {/* Theme toggle: passes `light` so the icon is white when the
              navbar is transparent (and dark mode = always white). */}
          <ThemeToggle light={light} />
          {isAuthed ? (
            <>
              <Button asChild size="sm" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/post-ad">
                  <Plus className="h-4 w-4 mr-1" /> Post Ad
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className={cn("hidden sm:inline-flex", !scrolled && !isDark && "text-white hover:bg-white/10 hover:text-white")}>
                <Link href={isAdmin ? "/admin" : "/dashboard"}>
                  {isAdmin ? <ShieldCheck className="h-4 w-4 mr-1" /> : <LayoutDashboard className="h-4 w-4 mr-1" />}
                  {isAdmin ? "Admin" : "Dashboard"}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className={cn("hidden sm:inline-flex", !scrolled && !isDark && "text-white hover:bg-white/10 hover:text-white")}>
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className={cn("hidden sm:inline-flex", !scrolled && !isDark && "text-white hover:bg-white/10 hover:text-white")}>
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
                className={cn("lg:hidden", !scrolled && !isDark && "text-white hover:bg-white/10 hover:text-white")}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" hideClose className="w-[300px] sm:w-[360px] p-0">
              <div className="flex flex-col h-full">
                {/* Header: brand mark (LARGER per user request) + a single
                    X close button on the right (recovered — there were two,
                    we removed both; now adding one back here). */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <BrandMark size="md" />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu" className="text-foreground/70 hover:text-foreground hover:bg-muted">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
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
