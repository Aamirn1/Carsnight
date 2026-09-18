import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { AdminNav } from "@/components/admin-nav";
import { SettingsForm } from "./settings-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Admin — Settings",
  description: "Edit site-wide Cars Night settings.",
  robots: { index: false, follow: false },
};

const ALLOWED_KEYS = ["site_name", "tagline", "contact_email", "hero_video_url", "announcement"];

export default async function AdminSettingsPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/signin?callbackUrl=/admin/settings");
  }

  const rows = await db.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) {
    if (ALLOWED_KEYS.includes(r.key)) settings[r.key] = r.value;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Admin Panel · Settings</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Site settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit site-wide configuration. Changes apply immediately across the site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to overview
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <AdminNav />
        <div className="flex-1 min-w-0">
          <SettingsForm initial={settings} />
        </div>
      </div>
    </div>
  );
}
