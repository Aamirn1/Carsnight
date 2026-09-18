"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Ban,
  CheckCircle2,
  Crown,
  User as UserIcon,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ShieldCheck,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { timeAgo } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  country: string | null;
  city: string | null;
  freePostsUsed: number;
  listingCredits: number;
  banned: boolean;
  createdAt: string;
}

interface Props {
  rows: AdminUserRow[];
  page: number;
  totalPages: number;
  total: number;
  currentAdminId: string;
  filterQ: string;
}

export function UsersAdminTable({
  rows,
  page,
  totalPages,
  total,
  currentAdminId,
  filterQ,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(filterQ || "");
  const [isPending, startTransition] = useTransition();
  const [creditUser, setCreditUser] = useState<AdminUserRow | null>(null);
  const [creditInput, setCreditInput] = useState("0");

  const updateParams = useCallback(
    (changes: Partial<Record<string, string>>) => {
      const params = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(changes)) {
        if (!v) {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
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

  const patchUser = async (
    id: string,
    body: { banned?: boolean; role?: string; listingCredits?: number },
  ) => {
    setPendingId(id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.error || "Failed to update user.");
      toast({
        title: "User updated",
        description: "The user account has been updated.",
      });
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Could not update user.",
        variant: "destructive",
      });
    } finally {
      setPendingId(null);
    }
  };

  const openCreditsDialog = (u: AdminUserRow) => {
    setCreditUser(u);
    setCreditInput(String(u.listingCredits ?? 0));
  };

  const submitCredits = async () => {
    if (!creditUser) return;
    const n = Math.max(0, Math.min(1000, Math.floor(Number(creditInput) || 0)));
    if (!Number.isFinite(n)) {
      toast({ title: "Invalid number", description: "Enter a value between 0 and 1000.", variant: "destructive" });
      return;
    }
    await patchUser(creditUser.id, { listingCredits: n });
    setCreditUser(null);
  };

  const initials = (name: string | null, email: string) => {
    const src = (name || email || "?").trim();
    const parts = src.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, email, country, or city..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
          aria-label="Search users"
        />
      </form>

      <div className="text-xs text-muted-foreground">
        {total === 0
          ? "No users found."
          : `Showing ${rows.length} of ${total.toLocaleString()} user${total === 1 ? "" : "s"}.`}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No users match your search</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a different keyword.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/70 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Free used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => {
                  const isSelf = u.id === currentAdminId;
                  return (
                    <TableRow key={u.id} className={cn(pendingId === u.id && "opacity-60")}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {initials(u.name, u.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground line-clamp-1 max-w-[180px]" title={u.name || ""}>
                              {u.name || u.email.split("@")[0]}
                              {isSelf && (
                                <Badge variant="outline" className="ml-2 text-[10px]">You</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.role === "ADMIN" ? (
                          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                            <ShieldCheck className="h-3 w-3" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <UserIcon className="h-3 w-3" /> User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground line-clamp-1 max-w-[160px]">
                          {u.city && u.country ? `${u.city}, ${u.country}` : u.country || u.city || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {u.listingCredits ?? 0}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {u.freePostsUsed ?? 0}<span className="text-xs"> / 2</span>
                      </TableCell>
                      <TableCell>
                        {u.banned ? (
                          <Badge variant="secondary" className="gap-1 bg-rose-100 text-rose-700">
                            <Ban className="h-3 w-3" /> Banned
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {timeAgo(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="User actions"
                                disabled={pendingId === u.id}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {u.banned ? (
                                <DropdownMenuItem onClick={() => patchUser(u.id, { banned: false })}>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Unban
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-rose-600 focus:text-rose-700"
                                  onClick={() => patchUser(u.id, { banned: true })}
                                >
                                  <Ban className="h-4 w-4" /> Ban user
                                </DropdownMenuItem>
                              )}
                              {u.role === "ADMIN" ? (
                                <DropdownMenuItem onClick={() => patchUser(u.id, { role: "USER" })}>
                                  <UserIcon className="h-4 w-4" /> Demote to User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => patchUser(u.id, { role: "ADMIN" })}>
                                  <Crown className="h-4 w-4 text-amber-500" /> Promote to Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => openCreditsDialog(u)}>
                                <Coins className="h-4 w-4" /> Adjust credits
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

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

      {/* Adjust credits dialog */}
      <Dialog open={!!creditUser} onOpenChange={(o) => !o && setCreditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" /> Adjust listing credits
            </DialogTitle>
            <DialogDescription>
              Set the number of paid listing credits for{" "}
              <span className="font-medium text-foreground">{creditUser?.email}</span>.
              The user can post one listing per credit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="credits-input">Listing credits</Label>
            <Input
              id="credits-input"
              type="number"
              min={0}
              max={1000}
              value={creditInput}
              onChange={(e) => setCreditInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Allowed range: 0 to 1000.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={submitCredits}
              disabled={!!pendingId}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {pendingId ? "Saving…" : "Save credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
