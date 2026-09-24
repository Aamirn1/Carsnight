"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// Mount-detection helper (no set-state-in-effect)
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// ============================================================================
// STAR TYPES
// ============================================================================
type StarType = "background" | "shooting";

interface Star {
  type: StarType;
  // Position (for background: static start; for shooting: start of travel)
  x: number;
  y: number;
  // Travel (shooting stars only)
  length: number;     // travel distance (px)
  angle: number;      // direction (radians) ~135° = upper-right → lower-left
  // Visual
  size: number;       // star core radius (px)
  opacity: number;    // base opacity 0..1
  color: string;      // star core color (hex)
  glowColor: string;  // glow color (rgba)
  trailColor: string; // trail color (rgba) — shooting stars only
  trailLength: number;// trail length (px) — shooting stars only
  // Animation
  delay: number;      // seconds before first appearance
  duration: number;   // seconds for one cycle (fade-in + move + fade-out)
  // Background star gentle drift
  driftX: number;      // px/s horizontal drift (background stars only)
  driftY: number;      // px/s vertical drift (background stars only)
  twinklePhase: number; // random phase offset for twinkling (background stars)
}

// ============================================================================
// COLOR PALETTE — PURPLE/VIOLET ONLY (no white, no blue, no other hues)
// ============================================================================
// Per spec: #8B5CF6 (neon violet), #A855F7 (bright purple), #6366F1 (blue-violet)
// The brightest parts may become lighter lavender/violet due to glow, but
// must still read as purple — never white.

// Background star colors (subtle, mostly violet)
const BG_COLORS = [
  "#8B5CF6", // neon violet
  "#8B5CF6", // weighted: most common
  "#8B5CF6",
  "#A855F7", // bright purple
  "#A855F7",
  "#6366F1", // blue-violet (subtle variation)
  "#6366F1",
  "#C4B5FD", // light lavender (for brighter tiny stars)
];

// Shooting star head colors (slightly brighter violet)
const SHOOT_COLORS = [
  "#A855F7", // bright purple
  "#A855F7",
  "#8B5CF6", // neon violet
  "#C4B5FD", // light lavender (brightest, still purple)
];

// Glow colors (rgba with alpha — soft, diffused, but visible)
const BG_GLOW = [
  "rgba(139,92,246,0.5)",
  "rgba(168,85,247,0.5)",
  "rgba(99,102,241,0.4)",
  "rgba(196,181,253,0.6)",
];

const SHOOT_GLOW = [
  "rgba(168,85,247,0.7)",
  "rgba(139,92,246,0.7)",
  "rgba(196,181,253,0.75)",
];

// Trail colors (rgba — tapered, fades to transparent)
const SHOOT_TRAIL = [
  "rgba(168,85,247,0.7)",
  "rgba(139,92,246,0.65)",
  "rgba(196,181,253,0.65)",
];

// ============================================================================
// RANDOM HELPERS
// ============================================================================
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================================
// STAR GENERATION
// ============================================================================
function generateBackgroundStar(width: number, height: number): Star {
  // Tiny: 1-3px core, moderate opacity (visible but subtle), random position
  const size = rand(1, 2.5); // small but visible
  const opacity = rand(0.4, 0.8); // visible enough to see against the dark hero
  const driftX = rand(-3, 3);     // gentle horizontal drift px/s
  const driftY = rand(2, 8);      // gentle downward drift px/s

  return {
    type: "background",
    x: rand(0, width),
    y: rand(0, height),
    length: 0,
    angle: 0,
    size,
    opacity,
    color: pick(BG_COLORS),
    glowColor: pick(BG_GLOW),
    trailColor: "",
    trailLength: 0,
    delay: rand(0, 6),
    duration: rand(4, 9), // long gentle cycle
    driftX,
    driftY,
    twinklePhase: rand(0, Math.PI * 2),
  };
}

function generateShootingStar(width: number, height: number): Star {
  // Diagonal from upper-right to lower-left (~135° ± 10°)
  const angle = rand(Math.PI * 0.70, Math.PI * 0.83); // ~126-150°
  // Start from upper-right area, some off-screen
  const x = rand(width * 0.3, width * 1.05);
  const y = rand(-height * 0.05, height * 0.35);
  // Travel distance
  const length = rand(height * 0.3, height * 0.7);
  // Speed: px/s — smooth easing, not too fast
  const speed = rand(80, 160);
  const duration = length / speed;
  // Head size: 2-4px (small, not large)
  const size = rand(1.5, 3);
  // Trail: 60-150px, thin (longer for more visible trails)
  const trailLength = rand(60, 150);
  const opacity = rand(0.7, 1);

  return {
    type: "shooting",
    x, y, length, angle,
    size,
    opacity,
    color: pick(SHOOT_COLORS),
    glowColor: pick(SHOOT_GLOW),
    trailColor: pick(SHOOT_TRAIL),
    trailLength,
    delay: rand(1, 12), // randomized long delays so shooting stars are occasional
    duration,
    driftX: 0,
    driftY: 0,
    twinklePhase: 0,
  };
}

// ============================================================================
// EASING — smooth, cinematic (ease-out for deceleration feel)
// ============================================================================
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ============================================================================
// COMPONENT
// ============================================================================
interface Props {
  /** Total number of stars. ~90-95% will be background, ~5-10% shooting. */
  count?: number;
}

/**
 * FallingStars — a subtle, premium, cinematic night-sky particle system.
 *
 * - ~90-95% tiny distant background stars (1-2px, low opacity, gentle drift,
 *   soft purple/violet glow, slow twinkle fade in/out).
 * - ~5-10% occasional shooting/falling stars (2-4px head, 30-80px tapered
 *   trail, diagonal upper-right → lower-left, smooth easing, randomized
 *   long delays so they appear occasionally not constantly).
 * - Color palette: #8B5CF6 (neon violet), #A855F7 (bright purple), #6366F1
 *   (blue-violet), #C4B5FD (light lavender). NO white, NO blue, NO other hues.
 * - Canvas-based for 60 FPS. pointer-events: none. z-index: 1 (behind content
 *   at z-10, above background image). Respects prefers-reduced-motion.
 * - Responsive: adjusts star count and sizes for mobile.
 */
export function FallingStars({ count = 60 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    // --- Canvas sizing (DPR-aware, capped at 2 for memory) ---
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h, dpr };
    };
    resize();
    window.addEventListener("resize", resize);

    // --- Initialize stars ---
    // On mobile, reduce density for performance
    const totalStars = prefersReduced ? 8 : isMobile ? Math.round(count * 0.6) : count;
    // ~7% shooting stars (within the 5-10% spec)
    const shootingCount = Math.max(2, Math.round(totalStars * 0.07));
    const bgCount = totalStars - shootingCount;

    const w = sizeRef.current.w;
    const h = sizeRef.current.h;

    starsRef.current = [
      ...Array.from({ length: bgCount }, () => generateBackgroundStar(w, h)),
      ...Array.from({ length: shootingCount }, () => generateShootingStar(w, h)),
    ];

    if (prefersReduced) {
      // Static stars only — no animation
      ctx.clearRect(0, 0, w, h);
      for (const star of starsRef.current) {
        if (star.type === "background") {
          drawBackgroundStar(ctx, star, star.x, star.y, star.opacity, 0);
        }
      }
      return () => {
        window.removeEventListener("resize", resize);
      };
    }

    // --- Animation loop ---
    let startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const cw = sizeRef.current.w;
      const ch = sizeRef.current.h;
      ctx.clearRect(0, 0, cw, ch);

      for (const star of starsRef.current) {
        if (star.type === "background") {
          // --- Background star: gentle drift + twinkle ---
          const cycleT = (elapsed + star.delay) % star.duration;
          const progress = cycleT / star.duration; // 0..1

          // Twinkle: fade in (0-20%), hold (20-70%), fade out (70-100%)
          let alpha = star.opacity;
          if (progress < 0.20) {
            alpha *= progress / 0.20;
          } else if (progress > 0.70) {
            alpha *= (1 - progress) / 0.30;
          }

          // Gentle drift (wrap around the canvas)
          let dx = (star.driftX * elapsed) % cw;
          let dy = (star.driftY * elapsed) % ch;
          if (dx < 0) dx += cw;
          if (dy < 0) dy += ch;
          let x = (star.x + dx) % cw;
          let y = (star.y + dy) % ch;
          if (x < 0) x += cw;
          if (y < 0) y += ch;

          // Subtle twinkle: vary opacity slightly with a sine wave
          const twinkle = 0.85 + 0.15 * Math.sin(elapsed * 0.8 + star.twinklePhase);
          alpha *= twinkle;

          drawBackgroundStar(ctx, star, x, y, alpha, elapsed);
        } else {
          // --- Shooting star: diagonal travel with easing ---
          const t = (elapsed - star.delay) % (star.duration + 4); // +4s gap between cycles
          if (t < 0) continue;
          if (t > star.duration) continue; // in the gap between cycles

          const progress = t / star.duration; // 0..1
          const eased = easeOutCubic(progress);

          // Fade in (first 10%), fade out (last 20%)
          let alpha = star.opacity;
          if (progress < 0.10) {
            alpha *= progress / 0.10;
          } else if (progress > 0.80) {
            alpha *= (1 - progress) / 0.20;
          }

          // Position
          const distance = eased * star.length;
          const dx = Math.cos(star.angle) * distance;
          const dy = Math.sin(star.angle) * distance;
          const x = star.x + dx;
          const y = star.y + dy;

          drawShootingStar(ctx, star, x, y, alpha);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [mounted, count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// DRAWING — BACKGROUND STARS (tiny, subtle, purple glow)
// ============================================================================
function drawBackgroundStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  x: number,
  y: number,
  alpha: number,
  _elapsed: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Soft glow (radial gradient — subtle but visible)
  const glowR = star.size * 4;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  grad.addColorStop(0, star.glowColor);
  grad.addColorStop(0.3, star.glowColor.replace(/[\d.]+\)$/, "0.15)"));
  grad.addColorStop(1, "rgba(139,92,246,0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Tiny core dot (1-2px)
  ctx.fillStyle = star.color;
  ctx.beginPath();
  ctx.arc(x, y, star.size, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ============================================================================
// DRAWING — SHOOTING STARS (thin tapered trail, small head, purple)
// ============================================================================
function drawShootingStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  x: number,
  y: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // --- Trail: thin, tapered, fades to transparent ---
  const trailDx = Math.cos(star.angle) * star.trailLength;
  const trailDy = Math.sin(star.angle) * star.trailLength;
  const trailX = x - trailDx;
  const trailY = y - trailDy;

  // Trail gradient: star color at head → transparent at tail
  const trailGrad = ctx.createLinearGradient(x, y, trailX, trailY);
  trailGrad.addColorStop(0, star.trailColor);
  trailGrad.addColorStop(0.5, star.trailColor.replace(/[\d.]+\)$/, "0.15)"));
  trailGrad.addColorStop(1, "rgba(139,92,246,0)");

  ctx.strokeStyle = trailGrad;
  ctx.lineWidth = star.size * 0.6; // thin trail
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(trailX, trailY);
  ctx.stroke();

  // --- Head: small bright core with soft glow ---
  const glowR = star.size * 3.5;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  grad.addColorStop(0, star.color);
  grad.addColorStop(0.2, star.glowColor);
  grad.addColorStop(1, "rgba(139,92,246,0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, glowR, 0, Math.PI * 2);
  ctx.fill();

  // Bright core (2-4px)
  ctx.fillStyle = star.color;
  ctx.beginPath();
  ctx.arc(x, y, star.size, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
