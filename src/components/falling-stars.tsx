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

// --- Star types -----------------------------------------------------------
interface Star {
  x: number;          // start x (px, relative to container)
  y: number;          // start y (px)
  length: number;     // travel distance (px)
  angle: number;      // travel direction (radians, default ~135deg = upper-right to lower-left)
  size: number;       // star diameter (px)
  speed: number;      // px per second
  delay: number;      // seconds before the star starts
  duration: number;   // seconds for one fall
  color: string;      // star color
  trailColor: string; // trail color
  trailLength: number;// trail length (px)
  opacity: number;    // base opacity (0..1)
  isShootingStar: boolean; // true = brighter with longer trail
}

// Color palette — white, very light blue, subtle violet/cyan
const STAR_COLORS = [
  "#FFFFFF",
  "#FFFFFF",
  "#FFFFFF",
  "#BFDBFE", // very light blue
  "#C7D2FE", // very light indigo
  "#DDD6FE", // very light violet
  "#A5F3FC", // very light cyan
];

const TRAIL_COLORS = [
  "rgba(255,255,255,0.6)",
  "rgba(255,255,255,0.6)",
  "rgba(191,219,254,0.5)", // light blue
  "rgba(199,210,254,0.5)", // light indigo
  "rgba(221,214,254,0.5)", // light violet
  "rgba(165,243,252,0.5)", // light cyan
];

// --- Random helpers -------------------------------------------------------
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateStar(width: number, height: number): Star {
  // 85% are small subtle particles, 15% are brighter shooting stars
  const isShootingStar = Math.random() < 0.15;

  // Direction: diagonally from upper-right to lower-left (135deg ± 15deg)
  const angle = rand(Math.PI * 0.65, Math.PI * 0.85); // ~117-153 deg

  // Start position: mostly in the upper-right area, but also random across the top
  // so stars fall throughout the hero (concentrated in the open area beneath/around the text)
  const x = rand(width * 0.2, width * 1.1); // start from right side, some off-screen
  const y = rand(-height * 0.1, height * 0.5); // start from top area

  // Travel distance
  const length = rand(height * 0.4, height * 0.9);

  // Size
  const size = isShootingStar ? rand(2, 3.5) : rand(1, 2);

  // Speed (px/s) — shooting stars are faster
  const speed = isShootingStar ? rand(120, 200) : rand(40, 90);

  // Duration = length / speed
  const duration = length / speed;

  // Delay — randomized so stars don't sync
  const delay = rand(0, 8);

  // Trail length
  const trailLength = isShootingStar ? rand(60, 120) : rand(15, 40);

  // Opacity — shooting stars are brighter
  const opacity = isShootingStar ? rand(0.7, 1) : rand(0.3, 0.6);

  return {
    x, y, length, angle, size, speed, delay, duration,
    color: pick(STAR_COLORS),
    trailColor: pick(TRAIL_COLORS),
    trailLength,
    opacity,
    isShootingStar,
  };
}

// --- Component ------------------------------------------------------------
interface Props {
  /** Number of stars to generate. Default 25 (sparse, elegant). */
  count?: number;
}

/**
 * FallingStars — a smooth, cinematic falling-star animation layer for the
 * hero section. Renders a full-viewport canvas with GPU-accelerated CSS
 * transforms (translate3d + opacity) for 60 FPS. Stars fall diagonally from
 * upper-right to lower-left with randomized size, speed, trajectory, and
 * timing. Occasional brighter shooting stars have luminous trails.
 *
 * Implementation:
 * - Uses a single <canvas> for all stars (most efficient for many particles).
 * - Animates via requestAnimationFrame, drawing each star as a gradient dot
 *   with a fading trail line.
 * - Stars are generated with randomized parameters and recycled when they
 *   complete their fall (fade out → reset to a new random start).
 * - pointer-events: none → doesn't interfere with buttons, links, or text.
 * - Respects prefers-reduced-motion: if set, renders a few static stars
 *   instead of animating.
 *
 * Layering (in the parent):
 *   background image → falling-star canvas → existing hero content
 * The canvas is positioned absolute inset-0 z-[1] (above the bg image, below
 * the content at z-10).
 */
export function FallingStars({ count = 25 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number | null>(null);
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Canvas sizing (DPR-aware, capped at 2 for memory) ---
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // --- Initialize stars ---
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const starCount = prefersReduced ? 5 : count; // very few static stars if reduced motion
    starsRef.current = Array.from({ length: starCount }, () => generateStar(w, h));

    if (prefersReduced) {
      // Render static stars (no animation)
      ctx.clearRect(0, 0, w, h);
      for (const star of starsRef.current) {
        drawStar(ctx, star, 0, 1);
      }
      return () => {
        window.removeEventListener("resize", resize);
      };
    }

    // --- Animation loop ---
    let startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000; // seconds
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < starsRef.current.length; i++) {
        const star = starsRef.current[i];
        // Calculate progress for this star
        const t = (elapsed - star.delay) % star.duration; // 0..duration
        const progress = t / star.duration; // 0..1

        if (progress < 0) continue; // not started yet (within delay)

        // Position: interpolate from start along the angle
        const distance = progress * star.length;
        const dx = Math.cos(star.angle) * distance;
        const dy = Math.sin(star.angle) * distance;
        const x = star.x + dx;
        const y = star.y + dy;

        // Fade in (first 15%) and fade out (last 25%)
        let alpha = star.opacity;
        if (progress < 0.15) {
          alpha *= progress / 0.15;
        } else if (progress > 0.75) {
          alpha *= (1 - progress) / 0.25;
        }

        drawStar(ctx, star, x, y, alpha);
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

// --- Drawing --------------------------------------------------------------
function drawStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  x: number,
  y: number,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Draw the trail (a line from the star back along the angle)
  const trailDx = Math.cos(star.angle) * star.trailLength;
  const trailDy = Math.sin(star.angle) * star.trailLength;
  const trailX = x - trailDx;
  const trailY = y - trailDy;

  // Trail gradient (fade from star color → transparent)
  const trailGrad = ctx.createLinearGradient(x, y, trailX, trailY);
  trailGrad.addColorStop(0, star.trailColor);
  trailGrad.addColorStop(1, "rgba(255,255,255,0)");

  ctx.strokeStyle = trailGrad;
  ctx.lineWidth = star.size * 0.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(trailX, trailY);
  ctx.stroke();

  // Draw the star itself (a glowing dot)
  // Use a radial gradient for the glow
  const glowRadius = star.size * (star.isShootingStar ? 4 : 2.5);
  const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  grad.addColorStop(0, star.color);
  grad.addColorStop(0.3, star.color);
  grad.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Core dot (bright center)
  ctx.fillStyle = star.color;
  ctx.beginPath();
  ctx.arc(x, y, star.size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
