"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Typewriter } from "@/components/typewriter";
import { Sparkles, Car, ChevronDown, Loader2 } from "lucide-react";

// --- Video sources ---------------------------------------------------------
// Desktop: 1280x720, ~5.2MB (re-encoded with GOP=2 + faststart for fast seeking)
// Mobile:  854x480, ~2.5MB (smaller, faster on weak connections)
const VIDEO_DESKTOP = "/videos/car-hero.mp4";
const VIDEO_MOBILE = "/videos/car-hero-mobile.mp4";
const POSTER_DESKTOP = "/car-poster.webp";
const POSTER_MOBILE = "/car-poster-mobile.webp";

// --- Component props -------------------------------------------------------
interface Props {
  tagline: string;
  announcement: string;
  saleCount: number;
  rentCount: number;
  userCount: number;
}

/**
 * VideoScrollHero — a premium cinematic hero where the user's scroll position
 * scrubs the timeline of a single persistent <video> element (no JPG frames,
 * no database; the MP4 is served as a static asset).
 *
 * Behavior:
 * - A single <video> (muted, playsinline, preload="auto", poster=...) is
 *   created once and never destroyed. The video is drawn onto a <canvas>
 *   each rAF tick for clean GPU compositing + legibility-overlay control.
 * - Hero section height = 100vh + 700px (600px on mobile). The inner container
 *   is sticky (100vh) so the canvas pins while the user scrolls through the
 *   ~700px (or 600px) "trigger zone".
 * - Scroll progress (0..1) maps to video.currentTime (0..duration).
 * - A lerp (0.18) smooths the target time so rapid mouse-wheel / trackpad
 *   movement decelerates cleanly without harsh jumps.
 * - When the user stops scrolling, the video stays at the corresponding time.
 * - When the user reaches the end of the trigger zone, the sticky releases
 *   and the rest of the website scrolls normally.
 * - The video NEVER autoplays independently — it is purely a function of
 *   scroll position.
 * - Poster image is shown until the video's `loadeddata` event fires (so the
 *   hero appears instantly on slow connections, with a graceful fallback).
 *
 * Performance:
 * - All animation state lives in refs (no React re-renders during scroll).
 * - The rAF loop only draws when currentTime changes (or a redraw is forced
 *   via needsRedrawRef — resize, first frame ready).
 * - Canvas backing store is DPR-aware (capped at 2× for memory).
 * - Single persistent video element (never recreated).
 *
 * Native video UI:
 * - No `controls` attribute → no play/timeline/volume/fullscreen UI.
 * - The video is hidden offscreen (used only as a source for the canvas),
 *   so even if a browser injected controls they wouldn't be visible.
 */
export function VideoScrollHero({ tagline, announcement, saleCount, rentCount, userCount }: Props) {
  // --- DOM refs ------------------------------------------------------------
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // --- React state (only for initial status — no per-scroll updates) -------
  const [videoReady, setVideoReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- Animation state (refs to avoid re-renders) --------------------------
  const targetTimeRef = useRef(0);       // scroll-driven target video time
  const currentTimeRef = useRef(0);       // smoothed current video time
  const lastDrawnTimeRef = useRef(-1);    // last actually-drawn time (s)
  const needsRedrawRef = useRef(true);   // forces redraw (resize, first frame)
  const rafRef = useRef<number | null>(null);

  // --- Detect mobile + pick sources ----------------------------------------
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (max-height: 500px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const videoSrc = isMobile ? VIDEO_MOBILE : VIDEO_DESKTOP;
  const posterSrc = isMobile ? POSTER_MOBILE : POSTER_DESKTOP;

  // --- Video setup: wait for it to be ready before enabling scroll scrubbing
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // When the video has enough data to draw, mark ready. We do NOT reset
    // currentTime here — that would fight with the scroll-driven seeking.
    // The first frame is shown by seeking to 0 on initial load (see below).
    const markReady = () => {
      setVideoReady(true);
      needsRedrawRef.current = true;
    };
    // `loadedmetadata` fires as soon as we have dimensions — enough to start
    // drawing the first frame. `canplay`/`loadeddata` fire later when more
    // data is buffered.
    const onLoadedMetadata = () => {
      needsRedrawRef.current = true;
      // Seek to 0 once on metadata load so the first frame is decoded + ready.
      try { v.currentTime = 0; } catch { /* not ready yet */ }
      markReady();
    };
    const onLoadedData = markReady;
    const onCanPlay = markReady;
    // Re-draw whenever a seek completes (covers the very-first-seek case where
    // `seeked` fires before our rAF tick would pick it up).
    const onSeeked = () => { needsRedrawRef.current = true; };
    const onError = () => {
      // graceful: leave videoReady = false; poster remains visible.
      console.warn("Hero video failed to load. Poster fallback active.");
    };

    // IMPORTANT: the video may have already finished loading by the time
    // this effect runs (e.g. HTTP cache, fast connection). In that case
    // `loadedmetadata`/`loadeddata`/`canplay` already fired and our listeners
    // would miss them. So we check readyState + videoWidth synchronously and
    // mark ready immediately. Use videoWidth > 0 (HAVE_METADATA) as the trigger.
    if (v.readyState >= 1 && v.videoWidth > 0) {
      markReady();
    }

    v.addEventListener("loadedmetadata", onLoadedMetadata);
    v.addEventListener("loadeddata", onLoadedData);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("error", onError);
    return () => {
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
      v.removeEventListener("loadeddata", onLoadedData);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("error", onError);
    };
  }, [videoSrc]);

  // --- Scroll → target time mapping ----------------------------------------
  useEffect(() => {
    const compute = () => {
      const section = sectionRef.current;
      const v = videoRef.current;
      if (!section || !v) return;
      const rect = section.getBoundingClientRect();
      const denom = rect.height - window.innerHeight;
      if (denom <= 0) {
        targetTimeRef.current = 0;
        if (scrollHintRef.current) scrollHintRef.current.style.opacity = "1";
        return;
      }
      const progress = Math.max(0, Math.min(1, -rect.top / denom));
      targetTimeRef.current = progress * (v.duration || 0);

      // Fade the scroll hint out as the user starts scrolling (gone by 25% progress)
      if (scrollHintRef.current) {
        const hintOpacity = Math.max(0, 1 - progress * 4);
        scrollHintRef.current.style.opacity = String(hintOpacity);
        scrollHintRef.current.style.transform = `translate(-50%, ${(1 - hintOpacity) * 10}px)`;
      }
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  // --- Canvas render loop (rAF + lerp) -------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const v = videoRef.current;
    if (!canvas || !v) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const draw = (): boolean => {
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

      // Always start with a black fill (opaque canvas)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, pxW, pxH);

      // Don't draw the video until it has at least metadata + dimensions.
      // We use videoWidth > 0 (HAVE_METADATA) instead of readyState >= 2
      // because readyState can fluctuate during seeks, and drawImage on a
      // video with metadata but no current frame is safe (it draws the last
      // decoded frame). The poster <img> covers the canvas until the first
      // real frame is drawn, so the user never sees a black flash.
      if (!videoReady || v.videoWidth === 0) {
        return false;
      }

      // object-fit: cover — scale video to fill canvas, crop overflow, center.
      // Preserves the car's proportions (no distortion); just crops edges.
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      const videoRatio = vw / vh;
      const canvasRatio = pxW / pxH;
      let drawW: number, drawH: number, drawX: number, drawY: number;
      if (videoRatio > canvasRatio) {
        // video wider than canvas → fit height, crop sides
        drawH = pxH;
        drawW = drawH * videoRatio;
        drawX = (pxW - drawW) / 2;
        drawY = 0;
      } else {
        // video taller than canvas → fit width, crop top/bottom
        drawW = pxW;
        drawH = drawW / videoRatio;
        drawX = 0;
        drawY = (pxH - drawH) / 2;
      }
      ctx.drawImage(v, drawX, drawY, drawW, drawH);
      return true;
    };

    const tick = () => {
      const v = videoRef.current;
      if (v && videoReady && v.duration > 0) {
        // Lerp current time toward target for smooth easing on rapid scroll.
        // 0.18 → ~5-6 frames of catch-up (≈100ms at 60fps). Smooth but tightly
        // coupled to scroll position.
        const target = targetTimeRef.current;
        const current = currentTimeRef.current;
        const diff = target - current;
        if (Math.abs(diff) < 0.005) {
          currentTimeRef.current = target;
        } else {
          currentTimeRef.current = current + diff * 0.18;
        }

        const timeToDraw = currentTimeRef.current;
        // Only seek the video if the time has meaningfully changed (avoid
        // spamming currentTime which triggers re-decodes).
        if (Math.abs(timeToDraw - v.currentTime) > 0.01) {
          try {
            v.currentTime = timeToDraw;
          } catch {
            // seeking can throw if the video isn't ready — ignore + retry next tick
          }
        }
      }

      // Redraw if (a) the time changed enough to cause a visible difference,
      // or (b) a redraw was explicitly forced (resize, first frame ready).
      const t = v ? v.currentTime : 0;
      if (Math.abs(t - lastDrawnTimeRef.current) > 0.008 || needsRedrawRef.current) {
        const drew = draw();
        if (drew) {
          lastDrawnTimeRef.current = t;
          needsRedrawRef.current = false;
          // Once the video is actually rendering to canvas, hide the poster <img>
          if (posterRef.current && posterRef.current.style.opacity !== "0") {
            posterRef.current.style.opacity = "0";
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => { needsRedrawRef.current = true; };
    window.addEventListener("resize", onResize);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      window.removeEventListener("resize", onResize);
    };
  }, [videoReady]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black h-[calc(100vh+600px)] md:h-[calc(100vh+700px)]"
      aria-label="Cinematic car showcase"
    >
      {/* Sticky container that pins the canvas while the user scrolls through
          the trigger zone (~700px desktop / ~600px mobile). */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Poster image shown instantly on load; fades out once the video
            is ready and rendering to the canvas. <img> (not next/image) so
            it appears with zero JS overhead. */}
        <img
          ref={posterRef}
          src={posterSrc}
          alt="White Lamborghini Aventador hero"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: 1 }}
          decoding="async"
          // @ts-expect-error fetchPriority is a valid React DOM prop but missing from TS types
          fetchPriority="high"
        />

        {/* Canvas — the video is drawn onto this each rAF tick. Using a
            canvas (instead of the raw <video>) gives us clean GPU compositing
            and avoids any chance of native video UI leaking through. */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Car animation controlled by scroll"
        />

        {/* Hidden persistent <video>. No `controls` attribute → no native UI
            (no play/timeline/volume/fullscreen). Sits offscreen as a source
            for the canvas. muted + playsinline so browsers allow it without
            user gesture and don't force fullscreen on iOS. preload="auto" so
            the browser starts fetching immediately. */}
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          muted
          playsInline
          preload="auto"
          // No `controls` → no native UI shown to the user.
          // No `autoplay` → never plays independently; purely scroll-driven.
          className="absolute h-px w-px opacity-0 pointer-events-none -z-10"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Legibility gradients — dark top/bottom and left so white overlay
            text stays readable over any video frame. pointer-events-none so
            the gradients never block clicks on the CTAs. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/75 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent pointer-events-none" />

        {/* Loading indicator (only visible briefly until the video loads) */}
        {!videoReady && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md px-3 py-1.5 text-xs text-white/80 border border-white/15">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Loading cinematic…</span>
          </div>
        )}

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
            Updated via direct DOM style (no React state, no re-renders). */}
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
