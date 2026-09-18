import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser, getUserQuota } from "@/lib/session";
import { toPublicListing, type PublicListing } from "@/lib/constants";
import { PostAdForm } from "@/components/post-ad-form";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ edit?: string }>;
}

export default async function PostAdPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/signin?callbackUrl=/post-ad");

  const { edit } = await searchParams;
  const quota = await getUserQuota(user.id);

  let initialListing: PublicListing | null = null;
  let editError: string | null = null;

  if (edit) {
    const existing = await db.listing.findUnique({ where: { id: edit } });
    if (!existing) {
      editError = "Listing not found.";
    } else if (existing.userId !== user.id && user.role !== "ADMIN") {
      editError = "You don't have permission to edit this listing.";
    } else {
      initialListing = toPublicListing(existing);
    }
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8">
      <PostAdForm
        initialListing={initialListing}
        editError={editError}
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
