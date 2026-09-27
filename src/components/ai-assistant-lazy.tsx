"use client";

import dynamic from "next/dynamic";

// Client-side wrapper so we can use `ssr: false` (Next.js 16 requires ssr:false
// dynamic imports to be in a Client Component). The AI assistant bundle is
// only downloaded after the page hydrates, keeping first paint fast.
const AIAssistant = dynamic(
  () => import("@/components/ai-assistant").then((m) => m.AIAssistant),
  { ssr: false, loading: () => null }
);

export function AIAssistantLazy() {
  return <AIAssistant />;
}
