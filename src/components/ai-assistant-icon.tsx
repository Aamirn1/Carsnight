"use client";

/**
 * AIAssistantIcon — premium live-animated SVG of the Cars Night AI assistant icon.
 *
 * Per user spec:
 *  - Gradient bubble border (purple → blue → cyan, flowing animation).
 *  - Inner white background REMOVED (transparent) — per user spec: "Remove the
 *    inner white background of chat icon make it transparent."
 *  - 3 gray message lines inside (kept, subtle on transparent).
 *  - Bottom-right V-shape tail pointing down-right.
 *  - Large blue/cyan star — REDUCED size, fixed at the left corner.
 *  - Small pink star — kept its size, positioned WITH the big star (same anchor).
 *  - Both stars orbit in OPPOSITE circular directions (chain-type animation):
 *    large = CLOCKWISE, small = ANTI-CLOCKWISE. No bouncing, no drifting.
 *  - NO outer white circle / badge background.
 */

interface AIAssistantIconProps {
  width?: number;
  className?: string;
}

// ViewBox bounds — captures the bubble + stars + tail + orbit margins.
const ICON_VIEWBOX_X = 10;
const ICON_VIEWBOX_Y = 42;
const ICON_VIEWBOX_W = 214;
const ICON_VIEWBOX_H = 192;
const ICON_ASPECT_RATIO = ICON_VIEWBOX_W / ICON_VIEWBOX_H;

export function AIAssistantIcon({ width, className = "" }: AIAssistantIconProps) {
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
        <defs>
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
        </defs>

        <g>
          {/* ============================================================
              CHAT BUBBLE — drawn FIRST (behind the sparkles). Inner
              background is TRANSPARENT (per user spec: "Remove the inner
              white background of chat icon make it transparent").
              ============================================================ */}
          <g className="ai-bubble-group">
            <path
              d="M 81,85 L 195,85 A 15,15 0 0,1 210,100 L 210,170 A 15,15 0 0,1 195,185 L 198,222 L 175,185 L 81,185 A 15,15 0 0,1 66,170 L 66,100 A 15,15 0 0,1 81,85 Z"
              fill="none"
              stroke="url(#ai-bubble-gradient)"
              strokeWidth="7"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* ============================================================
              SPARKLES — drawn ON TOP of the bubble. Both stars are FIXED
              at their positions near the TOP-LEFT corner of the gradient
              bubble. They rotate in place around their OWN centers like two
              connected gears — big star CLOCKWISE, small star ANTI-CLOCKWISE.
              No orbiting, no bouncing, no drifting — pure rotation only.

              Layout (per user spec):
                    small star (slightly above + slightly right)
                       ✦
                  big star (upper-left corner of bubble)
                     ✦
                [ chat bubble ]

              - Big star: center (64, 128), radius 34, at the left corner.
              - Small star: center (92, 90), radius 18, slightly above and
                to the right of the big star.
              ============================================================ */}
          <g transform="translate(64, 128)">
            <path
              className="ai-sparkle-large"
              d="M 0,-34 C 7,-20 9,-9 34,0 C 9,9 7,20 0,34 C -7,20 -9,9 -34,0 C -9,-9 -7,-20 0,-34 Z"
              fill="url(#ai-sparkle-large-gradient)"
            />
          </g>

          <g transform="translate(92, 90)">
            <path
              className="ai-sparkle-small"
              d="M 0,-18 C 4,-8 6,-4 18,0 C 6,4 4,8 0,18 C -4,8 -6,4 -18,0 C -6,-4 -4,-8 0,-18 Z"
              fill="url(#ai-sparkle-small-gradient)"
            />
          </g>
        </g>
      </svg>

      <style jsx>{`
        .ai-assistant-icon-wrapper {
          display: inline-block;
          contain: layout paint style;
        }

        /* ===== Big star — CLOCKWISE rotation around its own center (6s) =====
           Pure rotation only — NO translate, NO orbit, NO bounce.
           transform-box: fill-box makes transform-origin: center refer to
           the element's own bounding box center, not the SVG origin. */
        .ai-sparkle-large {
          transform-box: fill-box;
          transform-origin: center;
          animation: bigStarGear 6s linear infinite;
          will-change: transform;
        }
        @keyframes bigStarGear {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ===== Small star — ANTI-CLOCKWISE rotation around its own center (6s) =====
           Same duration as the big star (6s) so they look like connected gears
           turning against each other at the same speed. Pure rotation only. */
        .ai-sparkle-small {
          transform-box: fill-box;
          transform-origin: center;
          animation: smallStarGear 6s linear infinite;
          will-change: transform;
        }
        @keyframes smallStarGear {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }

        /* ===== HOVER (desktop) ===== */
        @media (hover: hover) {
          .ai-assistant-icon-wrapper:hover {
            transform: scale(1.06);
            transition: transform 0.4s ease;
          }
          .ai-assistant-icon-wrapper:hover .ai-bubble-group {
            filter: drop-shadow(0 0 6px rgba(123, 47, 255, 0.5))
                    drop-shadow(0 0 12px rgba(0, 229, 255, 0.4));
          }
        }

        /* ===== ACTIVE (tap) ===== */
        .ai-assistant-icon-wrapper:active {
          animation: ai-tap 0.3s ease;
        }
        @keyframes ai-tap {
          0%   { transform: scale(1); }
          50%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }

        /* ===== Accessibility ===== */
        @media (prefers-reduced-motion: reduce) {
          .ai-sparkle-large,
          .ai-sparkle-small,
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
