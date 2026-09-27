"use client";

/**
 * AIAssistantIcon — premium live-animated SVG recreation of the Cars Night
 * AI assistant icon, built to EXACTLY match the user's reference icon image.
 *
 * The icon design is PRESERVED EXACTLY (per user spec — do NOT redesign):
 *  - Rounded chat bubble (white interior) with a bottom-right tail pointing
 *    down-right.
 *  - Gradient border: purple → blue → cyan (bottom-left to top-right),
 *    strokeWidth=12 (slimmer than before — was 16, the user said the border
 *    was "too large and oversized" and the white inner area felt "too small").
 *  - Three gray message lines inside (one long top line, two shorter side-by-
 *    side lines below).
 *  - LARGE 4-point sparkle (blue/cyan gradient), X-orientation (points at 45°
 *    diagonals, top point aims upper-left), center at (68, 136), radius 52.
 *    The large star overlaps the bubble's left edge — the parts inside the
 *    bubble are hidden behind the white fill, only the parts extending
 *    outside (to the left and below) are visible.
 *  - SMALL 4-point sparkle (pink/magenta gradient), X-orientation, center at
 *    (96, 84), radius 18. Positioned ABOVE and to the UPPER-RIGHT of the large
 *    star — both stars form a cluster in the LEFT-LOWER area of the canvas,
 *    anchored near the bubble's left edge.
 *  - Size ratio: large star diameter : small star diameter ≈ 2.9 : 1 (per
 *    the reference icon — the large star is clearly dominant, the small
 *    star is a secondary accent).
 *
 * Animations (all CSS + SMIL, GPU-accelerated, respect prefers-reduced-motion):
 *  1. Flowing gradient border — purple→blue→cyan continuously flows around
 *     the outline via SMIL animateTransform on the gradient (5s linear
 *     infinite). The gradient direction rotates, making the colors appear
 *     to travel around the border. The icon itself does NOT rotate.
 *  2. Large sparkle — orbits CLOCKWISE around (68, 136) at a small radius
 *     (5 units, 7s linear infinite). The orbit is intentionally small so
 *     the star stays anchored to the left-corner cluster (per user spec:
 *     "the stars must remain visually fixed to the upper-left corner area
 *     of the icon, the orbit should be local and small"). Also twinkles
 *     (scale 0.96↔1.04 + opacity, 2.5s).
 *  3. Small sparkle — orbits ANTI-CLOCKWISE around (96, 84) at radius 4
 *     (6s linear infinite). Also twinkles (1.8s).
 *  4. Inner content (message lines) — subtle breathing scale (3.2s).
 *  5. Gray message lines — subtle sequential pulse (3.2s, staggered).
 *
 * CRITICAL — NO UP/DOWN FLOATING (per user spec):
 *  The previous implementation had an `ai-float` animation that translated
 *  the whole icon up and down by 3px. The user explicitly said: "The stars
 *  are moving up and down, which looks stupid and unnatural" and "NO up-down
 *  floating. NO random drifting. NO stupid bouncing." So the root-level
 *  float animation is REMOVED. The icon stays anchored in place. Only the
 *  gradient flows, the stars orbit in small circles (not vertical), and
 *  the inner content breathes (scale, not translate).
 *
 * CRITICAL — TRANSPARENT BACKGROUND (per user spec):
 *  The floating button has NO outer white circle / badge background.
 *  The area outside the icon is fully transparent. White color appears ONLY
 *  inside the chat bubble interior.
 */

interface AIAssistantIconProps {
  /** Rendered width of the SVG in pixels. Height is computed automatically
   * from the icon's natural aspect ratio so the icon is never stretched
   * or compressed. The wrapper also accepts the `ai-icon-responsive` class
   * which makes the width responsive via CSS (88px on mobile, 100px on
   * desktop) — useful when the parent wants to control the size via
   * Tailwind breakpoints instead of a fixed prop. */
  width?: number;
  /** Extra classes for the outer wrapper. Pass `ai-fab-icon` to make the
   * icon responsive (mobile 88px, desktop 100px) via CSS. */
  className?: string;
}

// Tight viewBox bounds: x=14, y=44, width=214, height=194.
// Computed from the actual artwork bounds + animation margins:
//   - Large sparkle: center (64, 128), radius 46, X-orientation. Points at
//     45° diagonals → top-left point at (64-46/√2, 128-46/√2) ≈ (32, 96);
//     bottom-left at (32, 160); with orbit radius 5 → (27, 91) to (27, 165).
//   - Small sparkle: center (96, 72), radius 18, X-orientation. Top point
//     at (96-18/√2, 72-18/√2) ≈ (83, 59); with orbit radius 4 → (79, 55).
//   - Bubble: x=66 to 210 (stroke adds 6 each side → 60 to 216),
//     y=85 to 185 (stroke adds 6 → 79 to 191; tail tip at y=224+6=230).
//   - Tail: tip at (196, 224), stroke adds 6 → x up to 202, y down to 230.
// So animated bounds: x=27..216 (w=189), y=55..230 (h=175).
// Adding a small margin → viewBox "14 44 214 194".
const ICON_VIEWBOX_X = 14;
const ICON_VIEWBOX_Y = 44;
const ICON_VIEWBOX_W = 214;
const ICON_VIEWBOX_H = 194;
const ICON_ASPECT_RATIO = ICON_VIEWBOX_W / ICON_VIEWBOX_H; // ~1.103

export function AIAssistantIcon({ width, className = "" }: AIAssistantIconProps) {
  // If `width` prop is provided, use it (with auto height from aspect ratio).
  // Otherwise, fall back to the responsive CSS class (mobile 88px, desktop 100px)
  // which sets the width via CSS; the SVG fills 100% of the wrapper.
  const isResponsive = !width;
  const computedWidth = width ?? 88;
  const computedHeight = Math.round((computedWidth / ICON_ASPECT_RATIO) * 100) / 100;
  return (
    <span
      className={`ai-assistant-icon-wrapper inline-block align-middle ${className}`}
      style={{
        width: isResponsive ? "100%" : computedWidth,
        height: isResponsive ? "auto" : computedHeight,
        lineHeight: 0,
        ...(isResponsive ? { aspectRatio: `${ICON_ASPECT_RATIO}` } : {}),
      }}
      aria-hidden="true"
    >
      <svg
        viewBox={`${ICON_VIEWBOX_X} ${ICON_VIEWBOX_Y} ${ICON_VIEWBOX_W} ${ICON_VIEWBOX_H}`}
        width={isResponsive ? "100%" : computedWidth}
        height={isResponsive ? "100%" : computedHeight}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", display: "block" }}
      >
        {/* ============================================================
            DEFS — gradients (with flowing animation) + glow filters
            ============================================================ */}
        <defs>
          {/* Main bubble border gradient — purple (bottom-left) → blue
              (center) → cyan (top-right). Animated via gradientTransform
              rotate to create the "flowing" effect (5s linear infinite).
              The gradient direction rotates continuously, so each point on
              the border cycles through purple → blue → cyan → purple,
              creating the "energy circulating" effect the user spec asks
              for. The icon itself does NOT rotate. */}
          <linearGradient
            id="ai-bubble-gradient"
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#7B2FFF" />
            <stop offset="50%" stopColor="#007BFF" />
            <stop offset="100%" stopColor="#00E5FF" />
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              values="0 0.5 0.5; 360 0.5 0.5"
              dur="5s"
              repeatCount="indefinite"
            />
          </linearGradient>

          {/* Large sparkle gradient — deep indigo/purple (bottom-left) → blue
              (center) → cyan (top-right). Same direction as the bubble
              gradient for visual harmony. */}
          <linearGradient
            id="ai-sparkle-large-gradient"
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#2B5FFF" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>

          {/* Small sparkle gradient — deep pink (top) → light magenta (bottom).
              Vertical gradient to distinguish it from the blue/cyan sparkles. */}
          <linearGradient
            id="ai-sparkle-small-gradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#FF007F" />
            <stop offset="100%" stopColor="#FF66C4" />
          </linearGradient>

          {/* Soft neon glow filter — purple/blue/cyan halo around the bubble
              and sparkles. Uses feGaussianBlur + feMerge to create a soft
              glow without losing the sharp source graphic. */}
          <filter id="ai-bubble-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur1" />
            <feGaussianBlur stdDeviation="4" in="SourceGraphic" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip path for the bubble interior — used to clip the message
              lines so the breathing scale doesn't let them extend beyond
              the bubble border. */}
          <clipPath id="ai-bubble-clip">
            <path d="M 81,85 L 195,85 A 15,15 0 0,1 210,100 L 210,170 A 15,15 0 0,1 195,185 L 166,185 L 196,224 L 198,185 L 81,185 A 15,15 0 0,1 66,170 L 66,100 A 15,15 0 0,1 81,85 Z" />
          </clipPath>
        </defs>

        {/* ============================================================
            ROOT GROUP — NO floating animation (per user spec: "NO up-down
            floating. NO random drifting. NO stupid bouncing.").
            The icon stays anchored in place. Only the gradient flows,
            the stars orbit in small circles, and the inner content
            breathes (scale, not translate).
            ============================================================ */}
        <g>
          {/* ============================================================
              CHAT BUBBLE — drawn FIRST (behind the sparkles). Per user
              spec: "Bring both stars to the FRONT so they are clearly
              visible above the icon." Previously the sparkles were drawn
              behind the bubble so the white fill covered the overlapping
              parts; now the sparkles are drawn ON TOP of the bubble so
              both stars are fully visible.
              ============================================================ */}
          <g className="ai-bubble-group">
            {/* Bubble outline — white fill + slimmer gradient stroke.
                strokeWidth=12 (per user spec: slimmer border). The tail
                now points RIGHT (tip at 196,224) matching the reference
                (per user spec: "The lower V/chat tail is wrong. It is
                currently pointing left. Rotate/reshape it so it points
                to the RIGHT"). strokeLinejoin="round" for smooth corners. */}
            <path
              d="M 81,85 L 195,85 A 15,15 0 0,1 210,100 L 210,170 A 15,15 0 0,1 195,185 L 166,185 L 196,224 L 198,185 L 81,185 A 15,15 0 0,1 66,170 L 66,100 A 15,15 0 0,1 81,85 Z"
              fill="#FFFFFF"
              stroke="url(#ai-bubble-gradient)"
              strokeWidth="12"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Inner content (message lines) — clipped to the bubble shape
                and animated with a subtle breathing scale. The transform-
                origin is at the center of the bubble interior (138, 135). */}
            <g clipPath="url(#ai-bubble-clip)">
              <g className="ai-bubble-inner" style={{ transformOrigin: "138px 135px" }}>
                {/* Line 1 (top, longest) — spans most of the bubble width */}
                <rect
                  x="84" y="108"
                  width="100" height="16"
                  rx="8" ry="8"
                  fill="#B8BCC8"
                  className="ai-msg-line ai-msg-line-1"
                  style={{ transformOrigin: "134px 116px" }}
                />
                {/* Line 2 (bottom-left, medium) */}
                <rect
                  x="84" y="138"
                  width="58" height="16"
                  rx="8" ry="8"
                  fill="#B8BCC8"
                  className="ai-msg-line ai-msg-line-2"
                  style={{ transformOrigin: "113px 146px" }}
                />
                {/* Line 3 (bottom-right, medium) — side by side with Line 2 */}
                <rect
                  x="150" y="138"
                  width="40" height="16"
                  rx="8" ry="8"
                  fill="#B8BCC8"
                  className="ai-msg-line ai-msg-line-3"
                  style={{ transformOrigin: "170px 146px" }}
                />
              </g>
            </g>
          </g>

          {/* ============================================================
              SPARKLES — drawn ON TOP of (in front of) the bubble so both
              stars are clearly visible (per user spec: "Bring both stars
              to the FRONT so they are clearly visible above the icon").
              Each sparkle is wrapped in an outer <g transform="translate
              (cx, cy)"> to position the orbit center, then .ai-sparkle-*
              for the orbit animation, then .ai-sparkle-*-inner for the
              twinkle. The star path is rotated 45° (X-orientation) so its
              points aim at the corners.

              Star sizes REDUCED (per user spec: "Reduce both stars size so
              it do not feels too big according to the chat icon gradient
              box"): large r=46 (was 52), small r=18 (kept, already small).

              Star positions anchored to the TOP-LEFT corner of the bubble
              (per user spec: "Keep both stars anchored near the top-left
              corner of the gradient bubble"):
              - Large star center (64, 128) — left of the bubble, vertically
                centered, overlapping the bubble's left edge.
              - Small star center (96, 72) — above and to the right of the
                large star, near the top-left corner of the bubble.
              ============================================================ */}

          {/* LARGE SPARKLE — center (64, 128), radius 46, X-orientation.
              Orbits CLOCKWISE around (64, 128) at radius 5 (7s linear).
              The orbit is small so the star stays anchored to the
              top-left corner (per user spec: "Keep both stars anchored
              near the top-left corner of the gradient bubble. Their orbit
              should be small and local, not drifting away").
              CLOCKWISE means: top → right → bottom → left → top (like a
              clock hand direction). */}
          <g transform="translate(64, 128)">
            <g className="ai-sparkle-large">
              <g className="ai-sparkle-large-inner">
                {/* Four-point star with concave cubic-bezier curves,
                    X-orientation (rotated 45°). Points at top-left, top-right,
                    bottom-right, bottom-left. Radius 46 (reduced from 52). */}
                <path
                  d="M 0,-46 C 9,-27 12,-12 46,0 C 12,12 9,27 0,46 C -9,27 -12,12 -46,0 C -12,-12 -9,-27 0,-46 Z"
                  fill="url(#ai-sparkle-large-gradient)"
                  filter="url(#ai-bubble-glow)"
                  transform="rotate(45)"
                />
              </g>
            </g>
          </g>

          {/* SMALL SPARKLE — center (96, 72), radius 18, X-orientation.
              Orbits ANTI-CLOCKWISE around (96, 72) at radius 4 (6s linear).
              Positioned above and to the right of the large star, near the
              top-left corner of the bubble.
              ANTI-CLOCKWISE means: top → left → bottom → right → top
              (opposite of the large star). */}
          <g transform="translate(96, 72)">
            <g className="ai-sparkle-small">
              <g className="ai-sparkle-small-inner">
                {/* Same concave 4-point star shape, radius 18,
                    X-orientation. */}
                <path
                  d="M 0,-18 C 4,-8 6,-4 18,0 C 6,4 4,8 0,18 C -4,8 -6,4 -18,0 C -6,-4 -4,-8 0,-18 Z"
                  fill="url(#ai-sparkle-small-gradient)"
                  filter="url(#ai-bubble-glow)"
                  transform="rotate(45)"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>

      {/* ==============================================================
          ANIMATIONS — CSS keyframes (GPU-accelerated transforms + opacity)
          ============================================================== */}
      <style jsx>{`
        .ai-assistant-icon-wrapper {
          display: inline-block;
          contain: layout paint style;
        }

        /* ===== Large sparkle — orbit CLOCKWISE (7s) =====
           The outer <g transform="translate(68, 136)"> positions the orbit
           center. The .ai-sparkle-large group applies the orbit:
             rotate(θ) translateX(r) rotate(-θ)
           which traces a circle of radius r around the parent translate
           point. The counter-rotation keeps the sparkle's own orientation
           stable (it orbits but doesn't spin). Radius 5 is small enough
           to keep the star anchored to the left-corner cluster (per user
           spec: "the stars must remain visually fixed to the upper-left
           corner area of the icon, the orbit should be local and small,
           the stars should never look like they are wandering away").
           Duration 7s (per spec: "big star: approximately 6–8 seconds"). */
        .ai-sparkle-large {
          animation: ai-orbit-cw 7s linear infinite;
          will-change: transform;
        }
        @keyframes ai-orbit-cw {
          0%   { transform: rotate(0deg)   translateX(5px) rotate(0deg); }
          25%  { transform: rotate(90deg)  translateX(5px) rotate(-90deg); }
          50%  { transform: rotate(180deg) translateX(5px) rotate(-180deg); }
          75%  { transform: rotate(270deg) translateX(5px) rotate(-270deg); }
          100% { transform: rotate(360deg) translateX(5px) rotate(-360deg); }
        }
        /* Twinkle for the large sparkle (2.5s) — subtle scale + opacity.
           Per spec: "slight scale pulse, slight glow pulse, slight opacity
           shift. Do NOT overdo it." */
        .ai-sparkle-large-inner {
          animation: ai-twinkle-large 2.5s ease-in-out infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }
        @keyframes ai-twinkle-large {
          0%   { transform: scale(0.96); opacity: 0.88; }
          50%  { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(0.96); opacity: 0.88; }
        }

        /* ===== Small sparkle — orbit ANTI-CLOCKWISE (6s) =====
           Orbit center (96, 84) via outer <g transform="translate(96, 84)">.
           Radius 4. Duration 6s (per spec: "small star: approximately 5–7
           seconds"). Different duration from the large sparkle (6s vs 7s)
           prevents the motion from looking robotic. */
        .ai-sparkle-small {
          animation: ai-orbit-ccw 6s linear infinite;
          will-change: transform;
        }
        @keyframes ai-orbit-ccw {
          0%   { transform: rotate(0deg)    translateX(4px) rotate(0deg); }
          25%  { transform: rotate(-90deg)  translateX(4px) rotate(90deg); }
          50%  { transform: rotate(-180deg) translateX(4px) rotate(180deg); }
          75%  { transform: rotate(-270deg) translateX(4px) rotate(270deg); }
          100% { transform: rotate(-360deg) translateX(4px) rotate(360deg); }
        }
        .ai-sparkle-small-inner {
          animation: ai-twinkle-small 1.8s ease-in-out infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }
        @keyframes ai-twinkle-small {
          0%   { transform: scale(0.96); opacity: 0.85; }
          50%  { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(0.96); opacity: 0.85; }
        }

        /* ===== Inner content breathing (3.2s) =====
           The message lines group scales subtly (1 ↔ 0.97 ↔ 1.02 ↔ 1)
           to simulate the "AI breathing" depth effect. This is a SCALE
           only (no translate) — per user spec: "NO up-down floating. NO
           random drifting." Transform-origin is at the center of the
           bubble interior (138, 135). */
        .ai-bubble-inner {
          animation: ai-breathe 3.2s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes ai-breathe {
          0%   { transform: scale(1); }
          33%  { transform: scale(0.97); }
          66%  { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        /* ===== Gray message lines — subtle sequential pulse (3.2s) =====
           Very subtle opacity pulse, staggered across the 3 lines
           (delays 0 / 0.4s / 0.8s) to communicate "AI is ready/thinking".
           NOT a loading spinner — just a gentle, premium pulse. */
        .ai-msg-line {
          animation: ai-msg-pulse 3.2s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .ai-msg-line-1 { animation-delay: 0s; }
        .ai-msg-line-2 { animation-delay: 0.4s; }
        .ai-msg-line-3 { animation-delay: 0.8s; }
        @keyframes ai-msg-pulse {
          0%   { transform: scale(1);    opacity: 1; }
          50%  { transform: scale(0.98); opacity: 0.78; }
          100% { transform: scale(1);    opacity: 1; }
        }

        /* ===== HOVER (desktop only — @media hover:hover) =====
           On hover: slightly scale the whole icon to 1.06 and increase the
           glow. All other animations keep running. Smooth 0.4s transition.
           Note: the hover scale is on the wrapper, NOT a translate — so no
           up/down bouncing. */
        @media (hover: hover) {
          .ai-assistant-icon-wrapper:hover {
            transform: scale(1.06);
            transition: transform 0.4s ease;
          }
          .ai-assistant-icon-wrapper:hover .ai-sparkle-large-inner,
          .ai-assistant-icon-wrapper:hover .ai-sparkle-small-inner {
            filter: brightness(1.25);
          }
          .ai-assistant-icon-wrapper:hover .ai-bubble-group {
            filter: drop-shadow(0 0 6px rgba(123, 47, 255, 0.5))
                    drop-shadow(0 0 12px rgba(0, 229, 255, 0.4));
          }
        }

        /* ===== ACTIVE (tap/click) — quick 1 → 0.94 → 1 squash (0.3s) =====
           A scale squash, NOT a translate — so no up/down bouncing. */
        .ai-assistant-icon-wrapper:active {
          animation: ai-tap 0.3s ease;
        }
        @keyframes ai-tap {
          0%   { transform: scale(1); }
          50%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }

        /* ===== Accessibility — prefers-reduced-motion =====
           For users who request reduced motion, disable ALL animations.
           The icon remains visually attractive in its static state. */
        @media (prefers-reduced-motion: reduce) {
          .ai-sparkle-large,
          .ai-sparkle-large-inner,
          .ai-sparkle-small,
          .ai-sparkle-small-inner,
          .ai-bubble-inner,
          .ai-msg-line,
          .ai-assistant-icon-wrapper:active {
            animation: none !important;
          }
          .ai-assistant-icon-wrapper:hover {
            transform: none !important;
          }
        }
      `}</style>
    </span>
  );
}
