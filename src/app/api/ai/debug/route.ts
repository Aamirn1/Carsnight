import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasZAI = !!process.env.ZAI_API_KEY || !!process.env.ZAI_TOKEN;
  const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini (default)";

  let openaiStatus = "not set";
  if (hasOpenAI) {
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      });
      if (res.ok) {
        openaiStatus = "valid (API key works)";
      } else {
        const errText = await res.text();
        openaiStatus = `invalid (HTTP ${res.status}: ${errText.slice(0, 200)})`;
      }
    } catch (e: any) {
      openaiStatus = `error: ${e.message}`;
    }
  }

  return NextResponse.json({
    hasOpenAI,
    hasZAI,
    openaiModel,
    openaiStatus,
    openaiKeyPrefix: process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.slice(0, 7) + "..."
      : "not set",
  });
}
