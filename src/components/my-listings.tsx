"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatPeriod, timeAgo, type PublicListing } from "@/lib/constants";

interface Props {
  listings: PublicListing[];
}

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
      </Badge>
    );
  }
  if (status === "PENDING") {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        <Clock className="h-3 w-3 mr-1" /> Pending
      </Badge>
    );
  }
  if (status === "REJECTED") {
    return (
      <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
        <XCircle className="h-3 w-3 mr-1" /> Rejected
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

export function MyListings({ listings }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!listings || listings.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30">
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Pencil className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">No listings yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Post your first ad to reach thousands of buyers and renters worldwide.
          </p>
          <Button asChild className="mt-4">
            <Link href="/post-ad">Post your first ad</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const onDelete = async (id: string, title: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete listing.");
      }
      toast({
        title: "Listing deleted",
        description: `"${title}" has been removed.`,
      });
      router.refresh();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Could not delete",
        description: e.message || "Something went wrong. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {listings.map((l) => {
        const img = l.images?.[0] || "/cars/porsche-red.png";
        const isRent = l.category === "RENT";
        return (
          <Card
            key={l.id}
            className="overflow-hidden border-border/70 shadow-sm hover:shadow-md transition-shadow py-0"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail */}
              <div className="relative sm:w-40 sm:h-32 h-32 shrink-0 bg-muted">
                <Image
                  src={img}
                  alt={`${l.make} ${l.model}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 160px"
                  className="object-cover"
                />
              </div>

              {/* Body */}
              <div className="flex-1 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={l.status} />
                    <Badge variant="secondary" className="text-xs">
                      {isRent ? "Rent" : "Sale"}
                    </Badge>
                    {l.featured && (
                      <Badge className="text-xs bg-primary/15 text-primary hover:bg-primary/20" variant="outline">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground truncate">
                    {l.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {l.city}, {l.country} · posted {timeAgo(l.createdAt)}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-primary">
                      {formatPrice(l.price, l.currency)}
                      {isRent && (
                        <span className="text-xs text-muted-foreground font-normal">
                          {formatPeriod(l.rentalPeriod)}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {l.views.toLocaleString()} views
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/post-ad?edit=${l.id}`} aria-label={`Edit ${l.title}`}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/listing/${l.slug || l.id}`} aria-label={`View ${l.title}`}>
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-white hover:border-destructive"
                        disabled={deletingId === l.id}
                        aria-label={`Delete ${l.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove &ldquo;{l.title}&rdquo; from the marketplace.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingId === l.id}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(l.id, l.title)}
                          disabled={deletingId === l.id}
                          className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                          {deletingId === l.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
