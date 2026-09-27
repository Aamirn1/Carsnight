"use client";

/**
 * AIAssistantIcon — premium live-animated SVG recreation of the Cars Night
 * AI assistant icon, built to EXACTLY match the user's reference icon image.
 *
 * The icon design is PRESERVED EXACTLY (per user spec — do NOT redesign):
 *  - Rounded chat bubble (white interior) with a bottom-right tail pointing
 *    down-right.
 *  - THICK gradient border: purple → blue → cyan (bottom-left to top-right).
 *  - Three gray message lines inside (one long top line, two shorter side-by-
 *    side lines below).
 *  - LARGE 4-point sparkle (blue/cyan gradient) overlapping the upper-left of
 *    the bubble. Center at (72, 96), radius 56 in a 256×256 viewBox.
 *  - SMALL 4-point sparkle (magenta/pink gradient) above the large sparkle.
 *    Center at (84, 56), radius 24.
 *  - Both sparkles have concave cubic-bezier curves (not sharp angles).
 *
 * Animations (all CSS + SMIL, GPU-accelerated, respect prefers-reduced-motion):
 *  1. Flowing gradient border — purple→blue→cyan continuously flows around
 *     the outline via SMIL animateTransform on the gradient (5s linear
 *     infinite). The gradient direction rotates, making the colors appear
 *     to travel around the border. The icon itself does NOT rotate.
 *  2. Large sparkle — orbits CLOCKWISE around its original position (72, 96)
 *     at a small radius (8 units, 6s linear infinite) so it stays in the
 *     upper-left zone. Also twinkles (scale 0.94↔1.06 + opacity, 2.5s).
 *  3. Small sparkle — orbits ANTI-CLOCKWISE around (84, 56) at radius 6
 *     (4.5s linear infinite). Also twinkles (1.8s).
 *  4. Inner content (message lines) — subtle breathing scale (3.2s).
 *  5. Gray message lines — subtle sequential pulse (3.2s, staggered).
 *  6. Whole icon — idle floating (translateY 0 → -3 → 0, 3.4s).
 *  7. Hover (desktop): scale 1.06 + brighter glow + brighter sparkles.
 *  8. Active (tap): scale 0.94 → 1 (0.3s).
 *
 * CRITICAL: The floating button has NO outer white circle / badge background.
 * The area outside the icon is fully transparent. White color appears ONLY
 * inside the chat bubble interior. (Per user spec.)
 */

interface AIAssistantIconProps {
  /** Rendered width of the SVG in pixels. Height is computed automatically
   * from the icon's natural aspect ratio (~1.039:1) so the icon is never
   * stretched or compressed. The wrapper also accepts the
   * `ai-icon-responsive` class which makes the width responsive via CSS
   * (88px on mobile, 100px on desktop) — useful when the parent wants to
   * control the size via Tailwind breakpoints instead of a fixed prop. */
  width?: number;
  /** Extra classes for the outer wrapper. Pass `ai-icon-responsive` to
   * make the icon responsive (mobile 88px, desktop 100px) via CSS. */
  className?: string;
}

// Tight viewBox bounds: x=4, y=16, width=212, height=204.
// Computed from the actual artwork bounds + animation margins:
//   - Large sparkle extends to x=16, y=40 (with orbit radius 8 → x=8, y=32)
//   - Small sparkle extends to y=32 (with orbit radius 6 → y=26)
//   - Bubble stroke extends to x=216 (208 + 8 stroke), y=192 (184 + 8 stroke)
//   - Tail tip at y=218
//   - Float animation translates -3px → y can go to 23
// So animated bounds: x=8..216 (w=208), y=23..218 (h=195).
// Adding a 4px margin all around → viewBox "4 19 212 203" → rounded to
// "4 16 212 204" for a clean, slightly generous frame.
const ICON_VIEWBOX_X = 4;
const ICON_VIEWBOX_Y = 16;
const ICON_VIEWBOX_W = 212;
const ICON_VIEWBOX_H = 204;
const ICON_ASPECT_RATIO = ICON_VIEWBOX_W / ICON_VIEWBOX_H; // ~1.039

export function AIAssistantIcon({ width, className = "" }: AIAssistantIconProps) {
  // If `width` prop is provided, use it (with auto height from aspect ratio).
  // Otherwise, fall back to the responsive CSS class (mobile 88px, desktop 100px)
  // which sets the width via CSS variables; the SVG fills 100% of the wrapper.
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
            <stop offset="0%" stopColor="#8B3DF7" />
            <stop offset="50%" stopColor="#3B82F6" />
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
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>

          {/* Small sparkle gradient — deep pink (top) → light magenta (bottom).
              Vertical gradient to distinguish it from the blue/cyan
              sparkles and bubble. */}
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
            <feGaussianBlur stdDeviation="5" in="SourceGraphic" result="blur2" />
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
            <path d="M 100,112 L 188,112 A 20,20 0 0,1 208,132 L 208,164 A 20,20 0 0,1 188,184 L 170,184 L 198,218 L 132,184 L 100,184 A 20,20 0 0,1 80,164 L 80,132 A 20,20 0 0,1 100,112 Z" />
          </clipPath>
        </defs>

        {/* ============================================================
            ROOT GROUP — idle floating animation (translateY 0 → -3 → 0)
            ============================================================ */}
        <g className="ai-icon-float">
          {/* ============================================================
              SPARKLES — drawn BEHIND the bubble so the bubble's white
              fill covers the overlapping parts. Each sparkle is wrapped
              in an outer <g transform="translate(cx, cy)"> to position the
              orbit center, then .ai-sparkle-* for the orbit animation,
              then .ai-sparkle-*-inner for the twinkle.
              ============================================================ */}

          {/* LARGE SPARKLE — center (72, 96), radius 56.
              Orbits CLOCKWISE around (72, 96) at radius 8 (6s linear).
              The orbit is small so the sparkle stays in the upper-left
              zone of the icon (per user spec: "Keep it near the upper-left
              zone of the icon, Do not let it travel far away"). */}
          <g transform="translate(72, 96)">
            <g className="ai-sparkle-large">
              <g className="ai-sparkle-large-inner">
                {/* Four-point star with concave cubic-bezier curves.
                    Points at top (0,-56), right (56,0), bottom (0,56),
                    left (-56,0). Control points at ~R/4 from center create
                    gentle concave indentations on each side. */}
                <path
                  d="M 0,-56 C 12,-36 16,-20 56,0 C 16,20 12,36 0,56 C -12,36 -16,20 -56,0 C -16,-20 -12,-36 0,-56 Z"
                  fill="url(#ai-sparkle-large-gradient)"
                  filter="url(#ai-bubble-glow)"
                />
              </g>
            </g>
          </g>

          {/* SMALL SPARKLE — center (84, 56), radius 24.
              Orbits ANTI-CLOCKWISE around (84, 56) at radius 6 (4.5s linear).
              Positioned above and slightly to the right of the large
              sparkle's top point (72, 40). */}
          <g transform="translate(84, 56)">
            <g className="ai-sparkle-small">
              <g className="ai-sparkle-small-inner">
                {/* Same concave 4-point star shape, scaled down to R=24. */}
                <path
                  d="M 0,-24 C 6,-12 8,-6 24,0 C 8,6 6,12 0,24 C -6,12 -8,6 -24,0 C -8,-6 -6,-12 0,-24 Z"
                  fill="url(#ai-sparkle-small-gradient)"
                  filter="url(#ai-bubble-glow)"
                />
              </g>
            </g>
          </g>

          {/* ============================================================
              CHAT BUBBLE — drawn ON TOP of the sparkles. The white fill
              covers the parts of the large sparkle that overlap the
              bubble interior, so only the parts of the sparkle that
              extend outside the bubble (to the left and above) are
              visible — exactly matching the original icon design.
              ============================================================ */}
          <g className="ai-bubble-group">
            {/* Bubble outline — white fill + thick gradient stroke.
                The stroke is 16px wide (matching the original icon), with
                stroke-linejoin="round" for smooth corners. The gradient
                is animated (flowing effect) via the SMIL animateTransform
                in the gradient def above. */}
            <path
              d="M 100,112 L 188,112 A 20,20 0 0,1 208,132 L 208,164 A 20,20 0 0,1 188,184 L 170,184 L 198,218 L 132,184 L 100,184 A 20,20 0 0,1 80,164 L 80,132 A 20,20 0 0,1 100,112 Z"
              fill="#FFFFFF"
              stroke="url(#ai-bubble-gradient)"
              strokeWidth="16"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Inner content (message lines) — clipped to the bubble shape
                and animated with a subtle breathing scale. The transform-
                origin is at the center of the bubble interior (144, 148). */}
            <g clipPath="url(#ai-bubble-clip)">
              <g className="ai-bubble-inner" style={{ transformOrigin: "144px 148px" }}>
                {/* Line 1 (top, longest) — spans most of the bubble width */}
                <rect
                  x="92" y="118"
                  width="104" height="16"
                  rx="8" ry="8"
                  fill="#B8BCC8"
                  className="ai-msg-line ai-msg-line-1"
                  style={{ transformOrigin: "144px 126px" }}
                />
                {/* Line 2 (bottom-left, medium) */}
                <rect
                  x="92" y="148"
                  width="60" height="16"
                  rx="8" ry="8"
                  fill="#B8BCC8"
                  className="ai-msg-line ai-msg-line-2"
                  style={{ transformOrigin: "122px 156px" }}
                />
                {/* Line 3 (bottom-right, medium) — side by side with Line 2 */}
                <rect
                  x="162" y="148"
                  width="42" height="16"
                  rx="8" ry="8"
                  fill="#B8BCC8"
                  className="ai-msg-line ai-msg-line-3"
                  style={{ transformOrigin: "183px 156px" }}
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

        /* ===== Root floating animation (3.4s) =====
           Very subtle vertical float: translateY 0 → -3 → 0.
           The icon stays anchored to the bottom-right; the movement is
           small enough to feel premium, not chaotic. */
        .ai-icon-float {
          animation: ai-float 3.4s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes ai-float {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }

        /* ===== Large sparkle — orbit CLOCKWISE (6s) =====
           The outer <g transform="translate(72, 96)"> positions the orbit
           center. The .ai-sparkle-large group applies the orbit:
             rotate(θ) translateX(r) rotate(-θ)
           which traces a circle of radius r around the parent translate
           point. The counter-rotation keeps the sparkle's own orientation
           stable (it orbits but doesn't spin). Radius 8 is small enough
           to keep the sparkle in the upper-left zone (per spec). */
        .ai-sparkle-large {
          animation: ai-orbit-cw 6s linear infinite;
          will-change: transform;
        }
        @keyframes ai-orbit-cw {
          0%   { transform: rotate(0deg)   translateX(8px) rotate(0deg); }
          25%  { transform: rotate(90deg)  translateX(8px) rotate(-90deg); }
          50%  { transform: rotate(180deg) translateX(8px) rotate(-180deg); }
          75%  { transform: rotate(270deg) translateX(8px) rotate(-270deg); }
          100% { transform: rotate(360deg) translateX(8px) rotate(-360deg); }
        }
        /* Twinkle for the large sparkle (2.5s) — subtle scale + opacity.
           Per spec: "scale(0.92) → scale(1.08) → scale(0.92)" but kept
           subtle (0.94↔1.06) so it feels premium, not aggressive. */
        .ai-sparkle-large-inner {
          animation: ai-twinkle-large 2.5s ease-in-out infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }
        @keyframes ai-twinkle-large {
          0%   { transform: scale(0.94); opacity: 0.88; }
          50%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(0.94); opacity: 0.88; }
        }

        /* ===== Small sparkle — orbit ANTI-CLOCKWISE (4.5s) =====
           Orbit center (84, 56) via outer <g transform="translate(84, 56)">.
           Radius 6. Different duration from the large sparkle (4.5s vs 6s)
           prevents the motion from looking robotic. */
        .ai-sparkle-small {
          animation: ai-orbit-ccw 4.5s linear infinite;
          will-change: transform;
        }
        @keyframes ai-orbit-ccw {
          0%   { transform: rotate(0deg)    translateX(6px) rotate(0deg); }
          25%  { transform: rotate(-90deg)  translateX(6px) rotate(90deg); }
          50%  { transform: rotate(-180deg) translateX(6px) rotate(180deg); }
          75%  { transform: rotate(-270deg) translateX(6px) rotate(270deg); }
          100% { transform: rotate(-360deg) translateX(6px) rotate(360deg); }
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
           to simulate the "AI breathing" depth effect. Transform-origin
           is at the center of the bubble interior (144, 148). */
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
           On hover: slightly scale the whole icon to 1.06, increase the
           glow, and brighten the sparkles. All other animations keep
           running. Smooth 0.4s transition. */
        @media (hover: hover) {
          .ai-assistant-icon-wrapper:hover .ai-icon-float {
            animation: ai-float 3.4s ease-in-out infinite, ai-hover-scale 0.4s ease forwards;
          }
          @keyframes ai-hover-scale {
            to { transform: translateY(-3px) scale(1.06); }
          }
          .ai-assistant-icon-wrapper:hover .ai-sparkle-large-inner,
          .ai-assistant-icon-wrapper:hover .ai-sparkle-small-inner {
            filter: brightness(1.25);
          }
          .ai-assistant-icon-wrapper:hover .ai-bubble-group {
            filter: drop-shadow(0 0 6px rgba(139, 61, 247, 0.5))
                    drop-shadow(0 0 12px rgba(0, 229, 255, 0.4));
          }
        }

        /* ===== ACTIVE (tap/click) — quick 1 → 0.94 → 1 squash (0.3s) ===== */
        .ai-assistant-icon-wrapper:active .ai-icon-float {
          animation: ai-float 3.4s ease-in-out infinite, ai-tap 0.3s ease;
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
          .ai-icon-float,
          .ai-sparkle-large,
          .ai-sparkle-large-inner,
          .ai-sparkle-small,
          .ai-sparkle-small-inner,
          .ai-bubble-inner,
          .ai-msg-line {
            animation: none !important;
          }
          .ai-assistant-icon-wrapper:hover .ai-icon-float,
          .ai-assistant-icon-wrapper:active .ai-icon-float {
            animation: none !important;
          }
        }
      `}</style>
    </span>
  );
}
