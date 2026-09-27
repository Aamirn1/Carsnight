"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef, FormEvent } from "react";
import Image from "next/image";
import { X, Send, Sparkles, Trash2, AlertTriangle, ArrowRight } from "lucide-react";
import { AIListingCard, type AIListing } from "@/components/ai-listing-card";

// ============================================================================
// Cars Night AI Assistant — floating button + chat panel
// ----------------------------------------------------------------------------
// - Floating button: bottom-right, fixed, neon-glow, uses /ai-assistant/ai-icon.png
// - Chat panel: dark glassmorphism, neon gradient accents, responsive
// - Mobile: full-screen overlay; Desktop: 400px wide panel
// - Lazy-loaded into the root layout via dynamic import with ssr:false
// ============================================================================

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  listings?: AIListing[];
  quickReplies?: string[];
  error?: boolean;
}

interface ApiReply {
  reply: string;
  listings?: AIListing[];
  quickReplies?: string[];
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Find the best car for your budget 🚗\nTell me what you're looking for and I'll search Cars Night for the best live options.",
  quickReplies: [
    "Find a car in my budget",
    "Find a rental",
    "Recommend a car for me",
    "Best family car",
  ],
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function AssistantImpl(_props: Record<string, never>, ref: React.Ref<{ open: () => void }>) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstOpenRef = useRef(false);

  // Expose a programmatic open to the parent (not currently used but available)
  useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);

  // Auto-scroll to newest message when messages change OR when sending starts
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  // Show a one-time tooltip after 3s if user hasn't opened the chat
  useEffect(() => {
    const t = setTimeout(() => {
      if (!firstOpenRef.current) setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  // Auto-hide tooltip when chat opens
  useEffect(() => {
    if (open) {
      firstOpenRef.current = true;
      setShowTooltip(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Lock body scroll while open on mobile
  useEffect(() => {
    if (typeof document === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    if (open && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error("Network");
      const data: ApiReply = await res.json();

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: data.reply || "I couldn't generate a response right now.",
        listings: data.listings || [],
        quickReplies: data.quickReplies || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: "I'm having trouble checking the latest Cars Night listings right now. Please try again in a moment.",
          quickReplies: ["Try again", "Find a car in my budget"],
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [messages, sending]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onQuickReply = (text: string) => {
    if (text === "Try again") {
      // Re-send the last user message
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (lastUser) send(lastUser.content);
      return;
    }
    send(text);
  };

  const onNewChat = () => {
    setMessages([WELCOME]);
    setInput("");
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60] print:hidden">
        {/* Tooltip */}
        {showTooltip && !open && (
          <div
            className="absolute bottom-[calc(100%+10px)] right-0 flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b0b14]/95 backdrop-blur px-3 py-2 shadow-2xl shadow-fuchsia-500/10"
            role="tooltip"
          >
            <span className="text-xs text-white/90 font-medium whitespace-nowrap">Ask Cars Night AI</span>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              aria-label="Dismiss tooltip"
              className="text-white/40 hover:text-white/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {/* Arrow */}
            <span className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-[#0b0b14]/95 border-r border-b border-white/10" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close Cars Night AI assistant" : "Open Cars Night AI assistant"}
          aria-expanded={open}
          className="group relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.08), 0 12px 32px -8px rgba(139,92,246,0.5), 0 0 24px -4px rgba(217,70,239,0.45)",
          }}
        >
          {/* Glow ring */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
            style={{
              background:
                "conic-gradient(from 0deg, #00A8FF, #6366F1, #8B5CF6, #D946EF, #00A8FF)",
              filter: "blur(8px)",
              transform: "scale(1.05)",
            }}
          />
          {/* Inner icon */}
          <span className="absolute inset-[2px] rounded-full overflow-hidden bg-[#0b0b14] ring-1 ring-white/10">
            {open ? (
              <span className="absolute inset-0 grid place-items-center text-white/90">
                <X className="h-6 w-6" />
              </span>
            ) : (
              <Image
                src="/ai-assistant/ai-icon.png"
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                priority
                unoptimized
              />
            )}
          </span>
        </button>
      </div>

      {/* Backdrop (mobile only) */}
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm sm:hidden animate-[ai-fade-in_0.2s_ease-out]"
        />
      )}

      {/* Chat panel */}
      {open && (
        <section
          aria-label="Cars Night AI Assistant"
          className="fixed z-50 flex flex-col overflow-hidden border border-white/10 bg-[#0b0b14]/95 backdrop-blur-xl shadow-2xl shadow-fuchsia-500/10 inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[400px] sm:h-[600px] sm:max-h-[calc(100vh-7rem)] sm:rounded-2xl rounded-none animate-[ai-slide-up_0.25s_ease-out]"
        >
          {/* Header */}
          <header className="relative flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#00A8FF]/10 via-[#8B5CF6]/10 to-[#D946EF]/10">
            <div className="relative h-10 w-10 rounded-full overflow-hidden ring-1 ring-white/15 shrink-0">
              <Image
                src="/ai-assistant/ai-icon.png"
                alt=""
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                Cars Night AI
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </h2>
              <p className="text-[11px] text-white/50 truncate">Your personal car-shopping assistant</p>
            </div>
            <button
              type="button"
              onClick={onNewChat}
              aria-label="Start a new chat"
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              title="New chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-4 space-y-4 ai-scroll"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onQuickReply={onQuickReply} disabled={sending} />
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-white/60 text-xs px-1">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "240ms" }} />
                </span>
                <span>Searching Cars Night…</span>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={onSubmit}
            className="border-t border-white/10 bg-[#0b0b14]/80 backdrop-blur p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cars, budgets, rentals…"
              disabled={sending}
              aria-label="Type your message"
              className="flex-1 min-w-0 rounded-full bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 focus:border-fuchsia-400/30 disabled:opacity-60"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="shrink-0 h-10 w-10 rounded-full grid place-items-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #00A8FF 0%, #6366F1 40%, #8B5CF6 70%, #D946EF 100%)",
                boxShadow: "0 4px 16px -4px rgba(139,92,246,0.6)",
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {/* Footer micro */}
          <div className="px-4 py-1.5 text-[10px] text-white/30 text-center border-t border-white/5">
            Powered by Cars Night AI · Recommendations from live listings only
          </div>
        </section>
      )}

      {/* Inline keyframes — only injected when this component mounts */}
      <style jsx global>{`
        @keyframes ai-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ai-slide-up { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        .ai-scroll::-webkit-scrollbar { width: 6px }
        .ai-scroll::-webkit-scrollbar-track { background: transparent }
        .ai-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 9999px }
        .ai-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18) }
      `}</style>
    </>
  );
}

function MessageBubble({
  message,
  onQuickReply,
  disabled,
}: {
  message: ChatMessage;
  onQuickReply: (text: string) => void;
  disabled: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] sm:max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm text-white shadow-sm"
              : "rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-white/90 bg-white/[0.04] border border-white/10 shadow-sm"
          }
          style={
            isUser
              ? { background: "linear-gradient(135deg, #00A8FF 0%, #6366F1 40%, #8B5CF6 70%, #D946EF 100%)" }
              : undefined
          }
        >
          {message.error && (
            <div className="flex items-center gap-1.5 text-amber-300 text-xs mb-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Couldn't reach the assistant</span>
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {/* Listing cards */}
        {message.listings && message.listings.length > 0 && (
          <div className="grid gap-2 w-full">
            {message.listings.map((l) => (
              <AIListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {/* Quick reply chips */}
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.quickReplies.map((qr, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onQuickReply(qr)}
                disabled={disabled}
                className="group inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/85 hover:text-white hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-3 w-3 text-fuchsia-400/80 group-hover:text-fuchsia-300" />
                <span className="truncate max-w-[200px]">{qr}</span>
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const AIAssistant = forwardRef(AssistantImpl);
