import { redirect } from "next/navigation";
import { getSessionUser, getUserQuota } from "@/lib/session";
import { hasSupabase } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase-server";
import { findListings, sbListingToPublic } from "@/lib/sb";
import { toPublicListing, type PublicListing } from "@/lib/constants";
import { db } from "@/lib/db";
import { PostAdForm } from "@/components/post-ad-form";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function PostAdPage({ searchParams }: PageProps) {
  let user;
  try {
    user = await getSessionUser();
  } catch {
    redirect("/signin?callbackUrl=/post-ad");
  }
  if (!user) redirect("/signin?callbackUrl=/post-ad");

  const { edit } = await searchParams;
  let quota: any = { freeRemaining: 0, paidRemaining: 0, total: 0, freeUsed: 0, freeLimit: 2 };
  try { quota = await getUserQuota(user.id); } catch {}

  let initialListing: PublicListing | null = null;
  let editError: string | null = null;

  if (edit) {
    try {
      if (hasSupabase()) {
        const sb = getSupabase();
        const { data } = await sb.from("Listing").select("*").eq("id", edit).limit(1);
        if (!data || data.length === 0) {
          editError = "Listing not found.";
        } else if (data[0].userId !== user.id && user.role !== "ADMIN") {
          editError = "You don't have permission to edit this listing.";
        } else {
          initialListing = sbListingToPublic(data[0] as any);
        }
      } else {
        const existing = await db.listing.findUnique({ where: { id: edit } });
        if (!existing) {
          editError = "Listing not found.";
        } else if (existing.userId !== user.id && user.role !== "ADMIN") {
          editError = "You don't have permission to edit this listing.";
        } else {
          initialListing = toPublicListing(existing);
        }
      }
    } catch {
      editError = "Could not load listing for editing.";
    }
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8">
      <PostAdForm
        initialListing={initialListing}
        editError={editError}
        userCountry={user.country || ""}
        userCity={user.city || ""}
        quota={{
          freeRemaining: quota.freeRemaining,
          paidRemaining: quota.paidRemaining,
          total: quota.total,
          freeUsed: quota.freeUsed,
          freeLimit: quota.freeLimit,
        }}
      />
    </div>
  );
}
