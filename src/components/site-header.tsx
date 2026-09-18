"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Plus, LayoutDashboard, LogOut, ShieldCheck, User as UserIcon, Car, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/cars-for-sale", label: "Cars for Sale" },
  { href: "/cars-for-rent", label: "Cars for Rent" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isAuthed = status === "authenticated" && !!session?.user;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <BrandMark />
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(l.href)
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
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/signup">
                  <Sparkles className="h-4 w-4 mr-1" /> Sign up free
                </Link>
              </Button>
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <BrandMark size="sm" />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
                  {NAV_LINKS.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <Link
                        href={l.href}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive(l.href) ? "bg-primary/10 text-primary" : "hover:bg-muted",
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
                        <Link href="/post-ad" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                          <Plus className="inline h-4 w-4 mr-1" /> Post Ad
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href={isAdmin ? "/admin" : "/dashboard"} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                          {isAdmin ? <ShieldCheck className="inline h-4 w-4 mr-1" /> : <LayoutDashboard className="inline h-4 w-4 mr-1" />}
                          {isAdmin ? "Admin Panel" : "Dashboard"}
                        </Link>
                      </SheetClose>
                      <button
                        onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted text-left"
                      >
                        <LogOut className="inline h-4 w-4 mr-1" /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link href="/signin" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                          <UserIcon className="inline h-4 w-4 mr-1" /> Sign in
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/signup" className="rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                          <Sparkles className="inline h-4 w-4 mr-1" /> Sign up free
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </nav>
                <div className="mt-auto p-4 border-t text-xs text-muted-foreground">
                  <Car className="inline h-3 w-3 mr-1 text-primary" /> Cars Night — Your global car marketplace
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
