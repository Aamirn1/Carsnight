"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Bitcoin,
  Coins,
  DollarSign,
  Loader2,
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  credits: number;
  description?: string | null;
  active?: boolean;
}

interface Props {
  plan: Plan;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type CryptoOption = "BTC" | "ETH" | "USDT";

const CRYPTO_WALLETS: Record<CryptoOption, { address: string; label: string }> = {
  BTC: { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", label: "Bitcoin (BTC)" },
  ETH: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", label: "Ethereum (ETH)" },
  USDT: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", label: "Tether (USDT)" },
};

export function CheckoutDialog({ plan, open, onOpenChange }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [method, setMethod] = useState<"CARD" | "CRYPTO">("CARD");
  const [crypto, setCrypto] = useState<CryptoOption>("BTC");
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const onPay = async () => {
    setPaying(true);
    try {
      const payload: any = {
        planId: plan.id,
        method,
      };
      if (method === "CRYPTO") {
        payload.cryptoWallet = CRYPTO_WALLETS[crypto].address;
      }
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: data.error || "Please try again.",
        });
        return;
      }
      toast({
        title: "Payment complete!",
        description: data.message || `${plan.credits} credits added to your account.`,
      });
      onOpenChange(false);
      router.push("/dashboard");
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Network error",
        description: e.message || "Could not reach the server.",
      });
    } finally {
      setPaying(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(CRYPTO_WALLETS[crypto].address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout — {plan.name}</DialogTitle>
          <DialogDescription>
            You&apos;ll receive <strong className="text-foreground">{plan.credits} listing credits</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Order summary */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{plan.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credits</span>
            <span className="font-medium">{plan.credits}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(plan.price, plan.currency || "USD")}
            </span>
          </div>
        </div>

        {/* Payment method toggle */}
        <Tabs value={method} onValueChange={(v) => setMethod(v as "CARD" | "CRYPTO")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="CARD">
              <CreditCard className="h-4 w-4" /> Credit Card
            </TabsTrigger>
            <TabsTrigger value="CRYPTO">
              <Bitcoin className="h-4 w-4" /> Crypto
            </TabsTrigger>
          </TabsList>

          {/* Credit Card tab */}
          <TabsContent value="CARD" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="cc-number">Card number</Label>
              <Input
                id="cc-number"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cc-expiry">Expiry</Label>
                <Input id="cc-expiry" placeholder="MM/YY" maxLength={5} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cc-cvc">CVC</Label>
                <Input id="cc-cvc" inputMode="numeric" placeholder="123" maxLength={4} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Powered by Stripe (demo). No real card is charged.
            </p>
          </TabsContent>

          {/* Crypto tab */}
          <TabsContent value="CRYPTO" className="space-y-3 pt-3">
            <div>
              <Label className="mb-2 block">Choose a coin</Label>
              <RadioGroup
                value={crypto}
                onValueChange={(v) => setCrypto(v as CryptoOption)}
                className="grid grid-cols-3 gap-2"
              >
                {(["BTC", "ETH", "USDT"] as CryptoOption[]).map((c) => (
                  <label
                    key={c}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 cursor-pointer transition-colors ${
                      crypto === c ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <RadioGroupItem value={c} id={`crypto-${c}`} className="sr-only" />
                    {c === "BTC" ? (
                      <Bitcoin className="h-5 w-5 text-primary" />
                    ) : c === "ETH" ? (
                      <Coins className="h-5 w-5 text-primary" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-primary" />
                    )}
                    <span className="text-xs font-medium">{c}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* QR placeholder */}
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 rounded-lg bg-muted border grid place-items-center shrink-0">
                <QrCode className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Send exactly {formatPrice(plan.price, plan.currency || "USD")} to:
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <code className="text-xs font-mono break-all bg-muted/50 px-2 py-1 rounded border block flex-1 min-w-0">
                    {CRYPTO_WALLETS[crypto].address}
                  </code>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={copyAddress}
                    aria-label="Copy address"
                    className="h-8 w-8 shrink-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Address copied
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-md p-2.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Send exactly {formatPrice(plan.price, plan.currency || "USD")} to the address above.
                Crypto payments are <strong>final</strong> — no chargebacks.
              </span>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={paying}>
            Cancel
          </Button>
          <Button onClick={onPay} disabled={paying}>
            {paying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Pay {formatPrice(plan.price, plan.currency || "USD")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
