"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Plus, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

// Main nav links (desktop top bar + burger menu)
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
  const [open, setOpen] = useState(false);

  // --- Scrolled state ---
  // Home page: transparent navbar at top → solid on scroll.
  // All other pages: solid from the top.
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);

  // --- Dark-mode detection ---
  // useSyncExternalStore reads document.documentElement.classList for "dark"
  // (set by next-themes before React hydrates) so it's correct from first
  // client render with no flash. Server snapshot = false (light mode default).
  const isDark = useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof document === "undefined") return false;
      return document.documentElement.classList.contains("dark");
    },
    () => false,
  );

  useEffect(() => {
    if (!isHome) return;
    const compute = () => {
      setScrolled(window.scrollY > window.innerHeight - 50);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [isHome]);

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isAuthed = status === "authenticated" && !!session?.user;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // ============================================================================
  // COLOR LOGIC (per user spec — works in both modes without refresh)
  // ============================================================================
  //
  // LIGHT MODE:
  //   - Home hero (transparent navbar): icons WHITE, "Cars" WHITE
  //   - Home scrolled (solid navbar): icons GRADIENT, "Cars" BLACK
  //   - Other pages (solid navbar): icons GRADIENT, "Cars" BLACK
  //   - Footer + burger menu: "Cars" BLACK
  //
  // DARK MODE:
  //   - Home hero (transparent navbar): icons WHITE, "Cars" WHITE
  //   - Home scrolled (solid navbar): icons WHITE, "Cars" WHITE
  //   - Other pages (solid navbar): icons WHITE, "Cars" WHITE
  //   - Footer + burger menu: "Cars" WHITE
  //
  // Summary:
  //   iconVariant = "white" when (transparent navbar AND light mode) OR dark mode
  //               = "gradient" when (solid navbar AND light mode)
  //   light (BrandMark) = true when (transparent navbar) OR dark mode
  //                     = false when (solid navbar AND light mode) → black "Cars"

  const isTransparent = isHome && !scrolled;

  // Icon variant: "white" for transparent navbar in light mode, or dark mode.
  // "gradient" for solid navbar in light mode.
  const iconVariant: "white" | "gradient" =
    (isTransparent && !isDark) || isDark ? "white" : "gradient";

  // BrandMark light prop: white "Cars" when transparent navbar OR dark mode.
  const logoLight = isTransparent || isDark;

  // Nav links + auth buttons: white text when transparent navbar (any mode),
  // dark text when solid navbar in light mode, white text when solid in dark mode.
  const navTextWhite = isTransparent || isDark;

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
          <BrandMark light={logoLight} />
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  navTextWhite
                    ? isActive(l.href)
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    : isActive(l.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant={iconVariant} />
          {isAuthed ? (
            <>
              <Button asChild size="sm" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/post-ad">
                  <Plus className="h-4 w-4 mr-1" /> Post Ad
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className={cn("hidden sm:inline-flex", navTextWhite && "text-white hover:bg-white/10 hover:text-white")}>
                <Link href={isAdmin ? "/admin" : "/dashboard"}>
                  {isAdmin ? <ShieldCheck className="h-4 w-4 mr-1" /> : <LayoutDashboard className="h-4 w-4 mr-1" />}
                  {isAdmin ? "Admin" : "Dashboard"}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className={cn("hidden sm:inline-flex", navTextWhite && "text-white hover:bg-white/10 hover:text-white")}>
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className={cn("hidden sm:inline-flex", navTextWhite && "text-white hover:bg-white/10 hover:text-white")}>
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
                className={cn(
                  "lg:hidden",
                  iconVariant === "white"
                    ? "text-white hover:bg-white/10 hover:text-white"
                    : "hover:bg-primary/10",
                )}
                aria-label="Open menu"
              >
                <Menu className={cn("h-5 w-5", iconVariant === "gradient" && "icon-neon")} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" hideClose className="w-[300px] sm:w-[360px] p-0">
              <div className="flex flex-col h-full">
                {/* Burger header: logo + close button.
                    "Cars" color: black in light mode, white in dark mode. */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <BrandMark size="md" light={isDark} />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu" className="text-foreground/70 hover:text-foreground hover:bg-muted">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>

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
