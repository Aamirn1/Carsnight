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

          <filter id="ai-bubble-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur1" />
            <feGaussianBlur stdDeviation="4" in="SourceGraphic" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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
              SPARKLES — drawn ON TOP of the bubble. Both stars are FIXED at
              the same anchor point (the left corner of the bubble) and orbit
              in OPPOSITE circular directions (chain-type animation).
              - Large star: center (64, 128), radius 34 (REDUCED from 46 per
                user spec: "reduce the size of big star"). Orbits CLOCKWISE.
              - Small star: center (64, 128) (SAME as large — per user spec:
                "position it with the big star fix it too"). Radius 18
                (untouched). Orbits ANTI-CLOCKWISE.
              Both orbit at radius 14, creating a chain-type animation where
              the two stars circle around the same point in opposite directions.
              ============================================================ */}
          <g transform="translate(64, 128)">
            <g className="ai-sparkle-large">
              <g className="ai-sparkle-large-inner">
                <path
                  d="M 0,-34 C 7,-20 9,-9 34,0 C 9,9 7,20 0,34 C -7,20 -9,9 -34,0 C -9,-9 -7,-20 0,-34 Z"
                  fill="url(#ai-sparkle-large-gradient)"
                  filter="url(#ai-bubble-glow)"
                  transform="rotate(45)"
                />
              </g>
            </g>
          </g>

          <g transform="translate(64, 128)">
            <g className="ai-sparkle-small">
              <g className="ai-sparkle-small-inner">
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

      <style jsx>{`
        .ai-assistant-icon-wrapper {
          display: inline-block;
          contain: layout paint style;
        }

        /* ===== Large star — CLOCKWISE circular orbit (7s) =====
           Radius 14. The star traces a perfect circle around (64, 128). */
        .ai-sparkle-large {
          animation: ai-orbit-cw 7s linear infinite;
          will-change: transform;
        }
        @keyframes ai-orbit-cw {
          0%   { transform: rotate(0deg)   translateX(14px) rotate(0deg); }
          25%  { transform: rotate(90deg)  translateX(14px) rotate(-90deg); }
          50%  { transform: rotate(180deg) translateX(14px) rotate(-180deg); }
          75%  { transform: rotate(270deg) translateX(14px) rotate(-270deg); }
          100% { transform: rotate(360deg) translateX(14px) rotate(-360deg); }
        }
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

        /* ===== Small star — ANTI-CLOCKWISE circular orbit (6s) =====
           Same center (64, 128) and same radius 14 as the large star, but
           orbiting in the OPPOSITE direction. This creates a chain-type
           animation where the two stars circle around the same point in
           opposite directions. */
        .ai-sparkle-small {
          animation: ai-orbit-ccw 6s linear infinite;
          will-change: transform;
        }
        @keyframes ai-orbit-ccw {
          0%   { transform: rotate(0deg)    translateX(14px) rotate(0deg); }
          25%  { transform: rotate(-90deg)  translateX(14px) rotate(90deg); }
          50%  { transform: rotate(-180deg) translateX(14px) rotate(180deg); }
          75%  { transform: rotate(-270deg) translateX(14px) rotate(270deg); }
          100% { transform: rotate(-360deg) translateX(14px) rotate(360deg); }
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

        /* ===== HOVER (desktop) ===== */
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
          .ai-sparkle-large-inner,
          .ai-sparkle-small,
          .ai-sparkle-small-inner,
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
