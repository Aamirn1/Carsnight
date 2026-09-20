"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/typewriter";
import { Sparkles, Car, ChevronDown } from "lucide-react";

// --- Frame configuration ----------------------------------------------------
// 240 JPG frames extracted from the user's car video (1280x720 each).
// Frames live at /public/hero-frames/ezgif-frame-XXX.jpg (001..240).
const TOTAL_FRAMES = 240;
const FIRST_BATCH = 30; // frames to load eagerly in parallel before the rest

function framePath(i: number): string {
  return `/hero-frames/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;
}

// --- Component props -------------------------------------------------------
interface Props {
  tagline: string;
  announcement: string;
  saleCount: number;
  rentCount: number;
  userCount: number;
}

/**
 * ScrollFrameHero — a premium, cinematic car hero section where the user's
 * scroll position controls a frame-by-frame animation rendered on a <canvas>.
 *
 * Behavior:
 * - 600px of scroll (500px on mobile) plays the entire 240-frame sequence.
 * - The hero section is `100vh + scrollDistance` tall, with a sticky 100vh
 *   inner container that pins the canvas while the user scrolls through the
 *   "trigger zone".
 * - Frame index is derived from scroll progress and eased toward the target
 *   via a lerp (0.18) for smooth, jitter-free transitions on rapid scroll.
 * - Frames are preloaded progressively: the first 30 frames load in parallel
 *   so the user can start scrolling immediately; the remaining 210 frames
 *   load sequentially in the background without blocking the UI.
 * - All animation state lives in refs (no React re-renders during scroll).
 */
export function ScrollFrameHero({ tagline, announcement, saleCount, rentCount, userCount }: Props) {
  // --- DOM refs -------------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // --- Animation state (refs to avoid re-renders) --------------------------
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const loadingPromiseRef = useRef<Map<number, Promise<HTMLImageElement | null>>>(new Map());
  const targetFrameRef = useRef(0);     // scroll-driven target frame (float)
  const currentFrameRef = useRef(0);     // smoothed current frame (float)
  const lastDrawnFrameRef = useRef(-1);  // last actually-drawn frame index
  const needsRedrawRef = useRef(true);   // true when a redraw is required (resize, new frame loaded)
  const rafRef = useRef<number | null>(null);

  // --- Frame loader (deduped, cached, triggers redraw on load) --------------
  const loadFrame = useCallback((idx: number): Promise<HTMLImageElement | null> => {
    if (idx < 0 || idx >= TOTAL_FRAMES) return Promise.resolve(null);
    // Already loaded & complete → return cached image
    const cached = imagesRef.current.get(idx);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
    // Already loading → return in-flight promise (dedupes concurrent requests)
    const inflight = loadingPromiseRef.current.get(idx);
    if (inflight) return inflight;

    const promise = new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        imagesRef.current.set(idx, img);
        loadingPromiseRef.current.delete(idx);
        // Trigger a redraw on the next animation frame so newly-loaded
        // frames appear even if the user is paused on them.
        needsRedrawRef.current = true;
        resolve(img);
      };
      img.onerror = () => {
        loadingPromiseRef.current.delete(idx);
        resolve(null); // graceful: missing frames just leave canvas black
      };
      img.src = framePath(idx);
    });
    loadingPromiseRef.current.set(idx, promise);
    return promise;
  }, []);

  // --- Progressive preload --------------------------------------------------
  // Load the first batch in parallel (so the user can scroll the first ~12.5%
  // of the animation immediately), then preload the rest sequentially in the
  // background so we don't saturate the network.
  useEffect(() => {
    let cancelled = false;
    const initialBatch = Array.from({ length: FIRST_BATCH }, (_, i) => loadFrame(i));
    Promise.all(initialBatch).then(() => {
      if (cancelled) return;
      let i = FIRST_BATCH;
      const preloadNext = () => {
        if (cancelled || i >= TOTAL_FRAMES) return;
        loadFrame(i).then(() => {
          i++;
          // setTimeout(0) yields to the browser so the UI stays responsive
          setTimeout(preloadNext, 0);
        });
      };
      preloadNext();
    });
    return () => { cancelled = true; };
  }, [loadFrame]);

  // --- Scroll → target frame mapping ---------------------------------------
  // progress = (scrolled distance into the trigger zone) / (total trigger zone)
  // Trigger zone = sectionHeight - viewportHeight (set via CSS).
  useEffect(() => {
    const compute = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const denom = rect.height - window.innerHeight;
      if (denom <= 0) {
        targetFrameRef.current = 0;
        if (scrollHintRef.current) scrollHintRef.current.style.opacity = "1";
        return;
      }
      const progress = Math.max(0, Math.min(1, -rect.top / denom));
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
      // Fade the scroll hint out as the user starts scrolling (gone by 25% progress)
      if (scrollHintRef.current) {
        const hintOpacity = Math.max(0, 1 - progress * 4);
        scrollHintRef.current.style.opacity = String(hintOpacity);
        scrollHintRef.current.style.transform = `translate(-50%, ${(1 - hintOpacity) * 10}px)`;
      }
    };
    compute();
    // passive: true so we don't block the scroll thread
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  // --- Canvas render loop (rAF + lerp) --------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const draw = (frameIdx: number): boolean => {
      const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIdx)));
      const img = imagesRef.current.get(idx);

      // Sync canvas backing-store size to viewport × DPR (cap DPR at 2 for perf)
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;
      const pxW = Math.round(cssW * dpr);
      const pxH = Math.round(cssH * dpr);
      if (canvas.width !== pxW || canvas.height !== pxH) {
        canvas.width = pxW;
        canvas.height = pxH;
        canvas.style.width = cssW + "px";
        canvas.style.height = cssH + "px";
      }

      // Always start with a black fill so the canvas is opaque (alpha: false)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, pxW, pxH);

      if (img && img.complete && img.naturalWidth > 0) {
        // object-fit: cover — scale image to fill canvas, crop overflow, center
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = pxW / pxH;
        let drawW: number, drawH: number, drawX: number, drawY: number;
        if (imgRatio > canvasRatio) {
          // image wider than canvas → fit height, crop sides
          drawH = pxH;
          drawW = drawH * imgRatio;
          drawX = (pxW - drawW) / 2;
          drawY = 0;
        } else {
          // image taller than canvas → fit width, crop top/bottom
          drawW = pxW;
          drawH = drawW / imgRatio;
          drawX = 0;
          drawY = (pxH - drawH) / 2;
        }
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        return true; // successfully drew the frame
      }
      // Frame not loaded yet — kick off a load (deduped) and return false
      // so the render loop retries on the next tick.
      loadFrame(idx);
      return false;
    };

    const tick = () => {
      // Lerp current frame toward target for smooth easing on rapid scroll.
      // 0.18 gives ~5-6 frames of "catch up" (≈100ms at 60fps) — smooth but
      // still tightly coupled to scroll position.
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const diff = target - current;
      if (Math.abs(diff) < 0.005) {
        currentFrameRef.current = target;
      } else {
        currentFrameRef.current = current + diff * 0.18;
      }

      const frameToDraw = Math.round(currentFrameRef.current);
      const img = imagesRef.current.get(frameToDraw);
      const isReady = !!(img && img.complete && img.naturalWidth > 0);

      // Only redraw if the frame index changed or a redraw was explicitly
      // requested (resize, newly-loaded frame). This keeps the rAF loop
      // essentially free when the user is paused on a loaded frame.
      if (frameToDraw !== lastDrawnFrameRef.current || needsRedrawRef.current) {
        const drawn = draw(frameToDraw);
        if (drawn && isReady) {
          lastDrawnFrameRef.current = frameToDraw;
          needsRedrawRef.current = false;
        }
        // If !drawn (frame still loading), we DON'T update lastDrawnFrameRef,
        // so the next tick will retry. This ensures newly-loaded frames
        // appear even when the user is paused.
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    // Force a redraw on resize so the canvas re-syncs to the new viewport
    const onResize = () => { needsRedrawRef.current = true; };
    window.addEventListener("resize", onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.removeEventListener("resize", onResize);
    };
  }, [loadFrame]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black h-[calc(100vh+500px)] md:h-[calc(100vh+600px)]"
      aria-label="Cinematic car showcase"
    >
      {/* Sticky container that pins the canvas while the user scrolls through
          the trigger zone (500-600px depending on viewport). */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* The canvas fills the viewport; we draw one frame at a time onto it. */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Car animation controlled by scroll"
        />

        {/* Legibility gradients — dark top/bottom and left so the white text
            stays readable over any frame. pointer-events-none so the gradients
            never block clicks on the CTAs. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/75 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent pointer-events-none" />

        {/* Content overlay — headline, typewriter, CTAs, stats */}
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/25 px-3.5 py-1.5 text-xs sm:text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 text-[#F5B82E]" /> {announcement}
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Your global car
                <br />
                marketplace,
                <span className="block min-h-[1.2em] mt-1">
                  <Typewriter
                    phrases={[
                      "no gravity needed!",
                      "Buy your dream car.",
                      "List a car in minutes.",
                      "Rent for special events.",
                      "Pay with crypto or card.",
                    ]}
                  />
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-white/80 max-w-xl">
                {tagline} Buy, sell, and rent cars across 20+ countries. Two free listings to start, then upgrade with Pro Plans from $5.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="btn-gold shadow-lg shadow-amber-900/30">
                  <Link href="/cars-for-sale"><Car className="h-4 w-4 mr-1.5" /> Browse cars</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href="/post-ad"><Sparkles className="h-4 w-4 mr-1.5" /> Post a free ad</Link>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
                <span><strong className="font-semibold text-white">{(saleCount + rentCount).toLocaleString()}+</strong> listings</span>
                <span className="text-white/30">·</span>
                <span><strong className="font-semibold text-white">20+</strong> countries</span>
                <span className="text-white/30">·</span>
                <span><strong className="font-semibold text-white">Crypto</strong> accepted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll-to-explore hint — fades out as the user starts scrolling.
            Updated via direct DOM manipulation (no React state) for perf. */}
        <div
          ref={scrollHintRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center gap-1 pointer-events-none transition-opacity"
        >
          <span className="uppercase tracking-widest text-[10px]">Scroll to explore</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
