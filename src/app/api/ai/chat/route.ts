import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { clientKey, rateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import {
  searchCars,
  searchRentals,
  getCarListing,
  compareListings,
  publicListingForAI,
} from "@/lib/ai-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ----------------------------------------------------------------------------
// LLM instance factory.
//
// Supports two providers:
// 1. OpenAI — when OPENAI_API_KEY is set in env vars. Uses the OpenAI
//    Chat Completions API (https://api.openai.com/v1/chat/completions).
//    Model: gpt-4o-mini (configurable via OPENAI_MODEL env var).
// 2. ZAI (z-ai-web-dev-sdk) — fallback when OPENAI_API_KEY is not set.
//    Uses the ZAI config file or ZAI_* env vars.
//
// To enable OpenAI on Vercel:
//   OPENAI_API_KEY=sk-...  (required)
//   OPENAI_MODEL=gpt-4o-mini  (optional, defaults to gpt-4o-mini)
// ----------------------------------------------------------------------------

interface LLMClient {
  chat: {
    completions: {
      create: (body: any) => Promise<any>;
    };
  };
}

let llmPromise: Promise<LLMClient> | null = null;

function getLLM(): Promise<LLMClient> {
  if (!llmPromise) {
    llmPromise = (async () => {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey) {
        // --- OpenAI provider ---
        const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
        return {
          chat: {
            completions: {
              create: async (body: any) => {
                const messages = body.messages.map((m: any) => ({
                  role: m.role === "assistant" ? "system" : m.role,
                  content: m.content,
                }));
                const res = await fetch("https://api.openai.com/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${openaiKey}`,
                  },
                  body: JSON.stringify({
                    model,
                    messages,
                    temperature: 0.7,
                    max_tokens: 1000,
                  }),
                });
                if (!res.ok) {
                  const err = await res.text();
                  throw new Error(`OpenAI API error: ${res.status} ${err}`);
                }
                const data = await res.json();
                // Normalize to the ZAI response format
                return {
                  choices: [
                    {
                      message: {
                        content: data.choices?.[0]?.message?.content ?? "",
                      },
                    },
                  ],
                };
              },
            },
          },
        };
      }

      // --- ZAI provider (fallback) ---
      const zaiConfig: any = {};
      const zaiApiKey = process.env.ZAI_API_KEY;
      const zaiBaseUrl = process.env.ZAI_BASE_URL;
      const zaiToken = process.env.ZAI_TOKEN;
      const zaiChatId = process.env.ZAI_CHAT_ID;
      const zaiUserId = process.env.ZAI_USER_ID;
      if (zaiApiKey || zaiBaseUrl || zaiToken) {
        zaiConfig.baseUrl = zaiBaseUrl || "https://internal-api.z.ai/v1";
        zaiConfig.apiKey = zaiApiKey || "Z.ai";
        if (zaiToken) zaiConfig.token = zaiToken;
        if (zaiChatId) zaiConfig.chatId = zaiChatId;
        if (zaiUserId) zaiConfig.userId = zaiUserId;
        return new ZAI(zaiConfig) as LLMClient;
      }
      return (await ZAI.create()) as LLMClient;
    })().catch((e) => {
      llmPromise = null;
      throw e;
    });
  }
  return llmPromise;
}

// ============================================================================
// /api/ai/chat — Cars Night AI Car Assistant
// ----------------------------------------------------------------------------
// Architecture:
//   1. Client sends { messages: [{role, content}], sessionId }
//   2. We feed the conversation to the LLM with a system prompt that tells it to
//      respond in a strict JSON shape that may include a "tool" request.
//   3. If the LLM requests a tool (search_cars / search_rentals / get_listing /
//      compare_listings), we execute it server-side against the live database.
//   4. We make a SECOND LLM call with the tool results so it can produce a
//      natural-language reply + recommend specific listings + explain why.
//   5. We return { reply, listings, quickReplies } to the client. The frontend
//      renders the reply text + the listing cards + clickable quick replies.
// ============================================================================

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Body {
  messages?: ChatMessage[];
  sessionId?: string;
}

const SYSTEM_PROMPT = `You are the Cars Night AI Car Assistant, a friendly, premium car-shopping assistant built into the Cars Night marketplace website.

YOUR MAIN GOAL: save the user time by helping them quickly find the most suitable cars currently listed on Cars Night, based on their budget, needs, preferred model, location, and whether they want to BUY or RENT.

ABSOLUTE RULES (never break):
1. Cars Night listings are ALWAYS the first priority. Only suggest general external car models if no matching Cars Night listings exist.
2. NEVER invent, fabricate, or guess Cars Night listings, prices, seller names, mileage, locations, or URLs. Every Cars Night listing you mention must come from the tool results you receive.
3. Never promise that a seller will reduce their price. Use wording like "you may be able to negotiate" or "it could be worth asking the seller" — never "the seller will lower the price".
4. Clearly distinguish Cars Night website listings (real inventory) from general car suggestions (your knowledge).
5. Keep replies concise, friendly, and useful. Do not write long essays.
6. Only ask one question at a time. Don't make the conversation feel like a long form. Only ask follow-up questions that materially improve the recommendation (budget, buy/rent, model preference, city, transmission, fuel type — only when needed).
7. Remember the user's stated preferences within the current session. Do not re-ask budget, buy/rent, or model if they already told you.

CONVERSATION FLOW:
- If the user says "sell" or wants to sell their car, explain that you help buyers and renters find listings, and direct them to the "Post Ad" feature (linked as /post-ad).
- If the user wants to buy: ask budget (if not given) → ask buy/rent (if not given) → ask preferred model/type (optional) → call search_cars → present 3–5 best matches as listing cards with short reasons.
- If the user wants to rent: ask budget (e.g. daily/weekly/monthly) → ask preferred model (optional) → call search_rentals → present matches with rental period clearly labeled.

BUDGET FORMATS:
Understand common South Asian budget formats:
- "40 lakh" = 4,000,000
- "50 lakh" = 5,000,000
- "1 crore" = 10,000,000
- "20 lakh" = 2,000,000
- "PKR 2,000,000" = 2,000,000
- "100,000/month" = monthly rental budget of 100,000
- "15,000/day rental" = daily rental budget of 15,000
The user's currency is most likely PKR but the database stores prices in USD. When the user says "40 lakh" treat it as a numeric budget value (4,000,000) and search with that numeric range; in your reply present the budget the way the user said it.

PRESENTING RESULTS:
- Group matches: "Best matches within your budget" (exact or below) and "Close to your budget" (slightly above, marked as negotiable).
- For each listing include: title, year, price, city, mileage, transmission, fuel type — plus a one-line reason WHY it's a good fit.
- If no listings match, say so clearly and suggest: increase budget, change model, expand location, consider older model, or try a different category. Then offer to search again.
- Always include the listing's id (the "id" field from the tool result) when mentioning a specific listing, so the client can render a clickable card.

RESPONSE FORMAT — STRICT JSON, NO MARKDOWN, NO BACKTICKS:
You must respond with a single JSON object (no surrounding text, no \`\`\`json fences) of the form:

{"reply": string, "tool": null | {"name": "search_cars" | "search_rentals" | "get_listing" | "compare_listings", "args": object}, "quickReplies": string[] (max 4, optional)}

Rules for the JSON:
- "reply" is your message to the user. If you're asking a clarifying question, set "tool": null and put the question in "reply".
- If you need to search listings, set "tool" to one of the tools with appropriate "args", AND put a short message in "reply" like "Let me search Cars Night for you…" so the user sees something while the tool runs.
- "quickReplies" are optional short suggestions the user can tap next (max 4 chips, each ≤ 40 chars).

TOOL ARGUMENTS (all keys are optional unless noted):
- search_cars: { listingType?: "SALE"|"RENT"|"ANY", minPrice?: number, maxPrice?: number, make?: string, model?: string, yearMin?: number, yearMax?: number, transmission?: string, fuelType?: string, city?: string, country?: string, mileageMax?: number, bodyType?: string, limit?: number }
- search_rentals: { minDailyPrice?: number, maxDailyPrice?: number, make?: string, model?: string, city?: string, country?: string, limit?: number }
- get_listing: { id: string }  (use this when the user asks about ONE specific listing)
- compare_listings: { ids: string[] }  (use this when the user wants to compare 2-4 specific listings, pass the listing ids)

IMPORTANT: only ONE tool call per response. If multiple tools are needed, call the most important one first and you can call more in the next turn.

WELCOME EXPERIENCE (when this is the first assistant turn, i.e. the user just said hi or opened the chat):
Respond with a friendly welcome and the quick reply suggestions, with "tool": null. Use this exact reply text:
"Find the best car for your budget 🚗\\nTell me what you're looking for and I'll search Cars Night for the best live options."
And these quickReplies: ["Find a car in my budget","Find a rental","Recommend a car for me","Best family car"].

GENERAL CAR QUESTIONS:
For "Civic vs Corolla", "best family SUV", "petrol vs hybrid" etc. — answer briefly in "reply" with "tool": null, and at the end of your reply, mention "I can also search Cars Night for live listings matching what you're looking for — just tell me your budget." with a quickReply like "Show me listings".

Remember: STRICT JSON only. No prose outside the JSON. No markdown fences.`;

interface ToolRequest {
  name: "search_cars" | "search_rentals" | "get_listing" | "compare_listings";
  args: any;
}

interface AssistantJson {
  reply: string;
  tool: ToolRequest | null;
  quickReplies?: string[];
}

/**
 * Try very hard to parse a JSON object out of the LLM response, even if it
 * accidentally wrapped it in markdown fences or added stray text.
 */
function parseAssistantJson(raw: string): AssistantJson | null {
  if (!raw) return null;
  let s = raw.trim();

  // Strip markdown fences ```json ... ``` or ``` ... ```
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) s = fence[1].trim();

  // Find the first { ... } balanced block
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let end = -1;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
    } else {
      if (ch === '"') inString = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
  }
  if (end === -1) return null;
  const jsonStr = s.slice(start, end + 1);
  try {
    const obj = JSON.parse(jsonStr);
    if (typeof obj !== "object" || obj === null) return null;
    if (typeof obj.reply !== "string") return null;
    return {
      reply: obj.reply,
      tool: obj.tool ?? null,
      quickReplies: Array.isArray(obj.quickReplies) ? obj.quickReplies.slice(0, 4) : undefined,
    };
  } catch {
    return null;
  }
}

async function runTool(tool: ToolRequest) {
  try {
    switch (tool.name) {
      case "search_cars": {
        const listings = await searchCars(tool.args || {});
        return { listings, summary: `Found ${listings.length} approved Cars Night listing(s).` };
      }
      case "search_rentals": {
        const listings = await searchRentals(tool.args || {});
        return { listings, summary: `Found ${listings.length} approved Cars Night rental listing(s).` };
      }
      case "get_listing": {
        if (!tool.args?.id) return { listings: [], summary: "No listing id provided." };
        const l = await getCarListing(String(tool.args.id));
        return { listings: l ? [l] : [], summary: l ? "Listing found." : "Listing not found or no longer available." };
      }
      case "compare_listings": {
        const ids: string[] = Array.isArray(tool.args?.ids) ? tool.args.ids : [];
        const listings = await compareListings(ids);
        return { listings, summary: `Loaded ${listings.length} listing(s) for comparison.` };
      }
      default:
        return { listings: [], summary: "Unknown tool." };
    }
  } catch {
    return { listings: [], summary: "Tool execution failed." };
  }
}

const SUMMARIZE_PROMPT = `You are the Cars Night AI Car Assistant. The user asked you something, and you decided to call a tool that searched the live Cars Night database. Below is the tool result. Now write the FINAL reply to the user.

ABSOLUTE RULES:
1. Only mention listings that appear in the tool result. Use each listing's exact id, title, price, year, city, mileage, transmission, fuelType from the data.
2. Never invent listings, prices, mileage, seller names, or locations.
3. Group matches: "Best matches within your budget" (at/below maxPrice) and "Close to your budget" (slightly above — say "may be negotiable").
4. For each listing give ONE short sentence explaining why it fits the user's stated needs.
5. If the tool returned no listings, say so clearly and offer alternatives (increase budget, change model, expand location, consider older model). Do NOT mention any listing.
6. End with a friendly next-step question or offer. Keep the whole reply under 200 words.

To reference a listing in your reply, write the literal token [[LISTING:<id>]] at the point in the text where the client should render a clickable card. For example:
"I found a great match: [[LISTING:abc-123]]. It's a strong fit because it stays within your budget."

You can reference multiple listings in the same reply, each with its own [[LISTING:<id>]] token. Do not list the same listing twice. Order your references by importance (best match first).

Respond with PLAIN TEXT (not JSON). No markdown, no code fences.`;

function buildToolResultSummary(tool: ToolRequest, result: { listings: any[]; summary: string }): string {
  const compact = result.listings.map((l) => ({
    id: l.id, title: l.title, category: l.category, price: l.price, currency: l.currency,
    make: l.make, model: l.model, year: l.year, mileage: l.mileage,
    fuelType: l.fuelType, transmission: l.transmission, bodyType: l.bodyType,
    color: l.color, country: l.country, city: l.city, rentalPeriod: l.rentalPeriod,
    featured: l.featured, sellerName: l.sellerName ?? null,
  }));
  return `Tool called: ${tool.name}(${JSON.stringify(tool.args || {})})\nResult: ${result.summary}\nListings (${compact.length}):\n${JSON.stringify(compact, null, 2)}`;
}

const FALLBACK_REPLY = "I'm having trouble checking the latest Cars Night listings right now. Please try again in a moment.";
const FALLBACK_QUICK_REPLIES = ["Find a car in my budget", "Find a rental", "Best family car"];

export async function POST(req: Request) {
  const key = `ai-chat:${clientKey(req)}`;
  const rl = rateLimit(key, RATE_LIMITS.general, 60_000);
  if (!rl.ok) return rateLimitResponse();

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const incoming: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
  if (incoming.length === 0) {
    return NextResponse.json({ error: "messages is required." }, { status: 400 });
  }
  // Keep only valid messages, cap to last 12 to control cost
  const clean = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant" || m.role === "system") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  try {
    const zai = await getLLM();

    // --- STEP 1: ask the LLM what to do (and which tool to call, if any) ---
    const firstMessages = [
      { role: "assistant" as const, content: SYSTEM_PROMPT },
      ...clean.map((m) => ({ role: m.role as any, content: m.content })),
    ];

    const completion1 = await zai.chat.completions.create({
      messages: firstMessages,
    });

    const raw1 = completion1.choices[0]?.message?.content ?? "";
    const parsed = parseAssistantJson(raw1);

    if (!parsed) {
      // LLM returned something unparseable — try once more with a gentle nudge
      const retryMessages = [
        ...firstMessages,
        { role: "assistant" as const, content: raw1 || "{}" },
        { role: "user" as const, content: "Respond with STRICT JSON only, in the shape {\"reply\": string, \"tool\": null, \"quickReplies\": string[]}. No markdown, no code fences, no prose outside the JSON." },
      ];
      const completionRetry = await zai.chat.completions.create({
        messages: retryMessages,
      });
      const rawRetry = completionRetry.choices[0]?.message?.content ?? "";
      const parsedRetry = parseAssistantJson(rawRetry);
      if (!parsedRetry) {
        return NextResponse.json({
          reply: FALLBACK_REPLY,
          listings: [],
          quickReplies: FALLBACK_QUICK_REPLIES,
        });
      }
      return await finalize(zai, clean, parsedRetry);
    }

    return await finalize(zai, clean, parsed);
  } catch {
    return NextResponse.json({
      reply: FALLBACK_REPLY,
      listings: [],
      quickReplies: FALLBACK_QUICK_REPLIES,
    });
  }
}

async function finalize(zai: any, history: ChatMessage[], parsed: AssistantJson) {
  // No tool requested — return the reply as-is
  if (!parsed.tool) {
    return NextResponse.json({
      reply: parsed.reply,
      listings: [],
      quickReplies: parsed.quickReplies ?? undefined,
    });
  }

  // Tool requested — execute it server-side
  const toolResult = await runTool(parsed.tool);
  const toolSummary = buildToolResultSummary(parsed.tool, toolResult);

  // --- STEP 2: ask the LLM to write the final user-facing reply using tool results ---
  const finalMessages = [
    { role: "assistant" as const, content: SUMMARIZE_PROMPT },
    ...history.map((m) => ({ role: m.role as any, content: m.content })),
    { role: "assistant" as const, content: `I decided to call a tool. My interim message to the user was: "${parsed.reply}"` },
    { role: "user" as const, content: `Here are the tool results. Please write the final reply for the user, using [[LISTING:<id>]] tokens to reference listings.\n\n${toolSummary}` },
  ];

  try {
    const completion2 = await zai.chat.completions.create({
      messages: finalMessages,
    });
    const reply = completion2.choices[0]?.message?.content ?? "";

    // Extract referenced listing ids from [[LISTING:<id>]] tokens in order
    const refs: string[] = [];
    const re = /\[\[LISTING:([^\]\s]+)\]\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(reply)) !== null) {
      if (!refs.includes(m[1])) refs.push(m[1]);
    }
    // Map ids to listings, keeping the order they were referenced
    const referencedListings = refs
      .map((id) => toolResult.listings.find((l) => l.id === id))
      .filter(Boolean) as any[];

    // If the model didn't reference any listings but some were found, surface up to 5
    const finalListings = referencedListings.length > 0
      ? referencedListings
      : toolResult.listings.slice(0, 5);

    // Clean the reply: remove the [[LISTING:...]] tokens (the frontend will render cards)
    const cleanReply = reply.replace(/\[\[LISTING:[^\]\s]+\]\]/g, "").trim();

    // If no listings found, make sure the reply says so (the LLM should, but enforce)
    const finalReplyText = cleanReply.length > 0 ? cleanReply : (toolResult.listings.length === 0
      ? "I couldn't find an active Cars Night listing that closely matches right now. Would you like to expand your budget, change the model, or try a different city?"
      : "Here are my best matches for you:");

    return NextResponse.json({
      reply: finalReplyText,
      listings: finalListings.map(publicListingForAI),
      quickReplies: parsed.quickReplies ?? undefined,
    });
  } catch {
    // If the second LLM call fails, still show the user the listings with the interim message
    return NextResponse.json({
      reply: parsed.reply || "Here are my best matches for you:",
      listings: toolResult.listings.slice(0, 5).map(publicListingForAI),
      quickReplies: parsed.quickReplies ?? undefined,
    });
  }
}
