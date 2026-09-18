"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckoutDialog, type Plan } from "@/components/checkout-dialog";

interface Props {
  plan: Plan;
  signedIn: boolean;
}

export function PlanBuyButton({ plan, signedIn }: Props) {
  const [open, setOpen] = useState(false);

  if (!signedIn) {
    return (
      <Button asChild size="lg" className="w-full">
        <a href={`/signin?callbackUrl=/pricing`}>Buy now</a>
      </Button>
    );
  }

  return (
    <>
      <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
        Buy now
      </Button>
      <CheckoutDialog plan={plan} open={open} onOpenChange={setOpen} />
    </>
  );
}
