"use client";

import { useState, useTransition, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Crown,
  Trash2,
  MoreHorizontal,
  Car,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, timeAgo } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface AdminListingRow {
  id: string;
  title: string;
  make: string;
  model: string;
  category: string;
  price: number;
  currency: string;
  country: string;
  city: string;
  status: string;
  featured: boolean;
  views: number;
  createdAt: string;
  images: string[];
  user: { id: string; name: string | null; email: string } | null;
}

interface Filters {
  status: string; // ALL | PENDING | APPROVED | REJECTED
  category: string; // ALL | SALE | RENT
  q: string;
}

interface Props {
  rows: AdminListingRow[];
  page: number;
  totalPages: number;
  total: number;
  filters: Filters;
}

export function ListingAdminTable({ rows, page, totalPages, total, filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(filters.q || "");
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (changes: Partial<Record<string, string>>) => {
      const params = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(changes)) {
        if (!v || v === "ALL" || v === "") {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
      // Reset page when filters change (except when changing page itself).
      if (!("page" in changes)) params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, startTransition],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() });
  };

  const patchListing = async (
    id: string,
    body: { status?: string; featured?: boolean },
  ) => {
    setPendingId(id);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to update listing.");
      }
      toast({
        title: body.status ? `Listing ${body.status.toLowerCase()}` : body.featured ? "Listing featured" : "Listing unfeatured",
        description: "The listing has been updated.",
      });
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Could not update listing.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setPendingId(deleteId);
    try {
      const res = await fetch(`/api/listings/${deleteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete listing.");
      toast({
        title: "Listing deleted",
        description: "The listing has been removed.",
      });
      setDeleteId(null);
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Could not delete listing.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, make or model..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
            aria-label="Search listings"
          />
        </form>
        <div className="flex gap-2">
          <Select
            value={filters.status}
            onValueChange={(v) => updateParams({ status: v })}
          >
            <SelectTrigger className="w-[150px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.category}
            onValueChange={(v) => updateParams({ category: v })}
          >
            <SelectTrigger className="w-[130px]" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="SALE">For Sale</SelectItem>
              <SelectItem value="RENT">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Result count */}
      <div className="text-xs text-muted-foreground">
        {total === 0
          ? "No listings found."
          : `Showing ${rows.length} of ${total.toLocaleString()} listing${total === 1 ? "" : "s"}.`}
      </div>

      {/* Table or empty state */}
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No listings match your filters</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try clearing the search or selecting &ldquo;All&rdquo;.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/70 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Listing</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className={cn(pendingId === r.id && "opacity-60")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={r.images?.[0] || "/cars/porsche-red.png"}
                            alt={`${r.make} ${r.model}`}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/listing/${r.id}`}
                            className="font-medium text-foreground hover:text-primary line-clamp-1"
                            title={r.title}
                          >
                            {r.title}
                          </Link>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {r.make} {r.model}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground line-clamp-1 max-w-[160px]" title={r.user?.email || ""}>
                        {r.user?.name || r.user?.email || "—"}
                      </div>
                      {r.user?.email && (
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[160px]">
                          {r.user.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.category === "RENT" ? (
                        <Badge variant="outline">For Rent</Badge>
                      ) : (
                        <Badge variant="secondary">For Sale</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(r.price, r.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm line-clamp-1 max-w-[160px]">
                        {r.city}, {r.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} featured={r.featured} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        {r.views.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {timeAgo(r.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Listing actions"
                            disabled={pendingId === r.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {r.status !== "APPROVED" && (
                            <DropdownMenuItem
                              onClick={() => patchListing(r.id, { status: "APPROVED" })}
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Approve
                            </DropdownMenuItem>
                          )}
                          {r.status !== "REJECTED" && (
                            <DropdownMenuItem
                              onClick={() => patchListing(r.id, { status: "REJECTED" })}
                            >
                              <XCircle className="h-4 w-4 text-rose-600" /> Reject
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              patchListing(r.id, { featured: !r.featured })
                            }
                          >
                            <Crown
                              className={cn(
                                "h-4 w-4",
                                r.featured ? "text-amber-500" : "text-muted-foreground",
                              )}
                            />
                            {r.featured ? "Unfeature" : "Feature"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-700"
                            onClick={() => setDeleteId(r.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isPending}
              onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isPending}
              onClick={() => updateParams({ page: String(Math.min(totalPages, page + 1)) })}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The listing and all its data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!pendingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={!!pendingId}
            >
              {pendingId ? "Deleting…" : "Delete listing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ status, featured }: { status: string; featured: boolean }) {
  if (status === "APPROVED") {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 w-fit">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </Badge>
        {featured && (
          <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 w-fit">
            <Crown className="h-3 w-3" /> Featured
          </Badge>
        )}
      </div>
    );
  }
  if (status === "REJECTED") {
    return (
      <Badge variant="secondary" className="gap-1 bg-rose-100 text-rose-700">
        <XCircle className="h-3 w-3" /> Rejected
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700">
      <Car className="h-3 w-3" /> Pending
    </Badge>
  );
}
