"use client";

/**
 * AIAssistantIcon — a premium live-animated SVG recreation of the Cars Night
 * AI assistant icon, built per the user's spec.
 *
 * Visual identity (preserved exactly from the supplied reference icon):
 *  - Rounded chat bubble (white interior) with a tail pointing bottom-right
 *  - Gradient border: purple → violet → blue → cyan (flowing animation)
 *  - Three gray message lines inside the bubble (subtle breathing pulse)
 *  - Large sparkle (blue/cyan) on the upper-left — orbits clockwise + twinkles
 *  - Small sparkle (magenta/pink) above it — orbits anti-clockwise + twinkles
 *  - Soft neon glow around the bubble (violet/blue/cyan)
 *
 * Animations (all CSS @keyframes, GPU-accelerated, respect prefers-reduced-motion):
 *  - Gradient flow around the border (4-6s linear infinite)
 *  - Large sparkle: orbit clockwise (6s) + twinkle (2.5s)
 *  - Small sparkle: orbit anti-clockwise (4.5s) + twinkle (1.8s)
 *  - Inner white area: subtle breathing (3.2s)
 *  - Gray message lines: subtle sequential pulse (3.2s, staggered)
 *  - Whole icon: idle floating translateY (-3px, 3.4s)
 *  - Hover (desktop): scale 1.06 + brighter glow + brighter sparkles
 *  - Active (tap): scale 0.94 then 1 (0.3s)
 *
 * Container:
 *  - NO outer white circle / badge background — fully transparent outside the icon
 *  - Size: 64-72px desktop, 60-68px mobile (controlled by parent)
 *  - White only inside the chat bubble; everything else transparent
 */

interface AIAssistantIconProps {
  /** Pixel size of the SVG viewBox. The icon scales to its container. */
  size?: number;
  /** Extra classes for the outer wrapper (e.g. hover state hooks). */
  className?: string;
}

export function AIAssistantIcon({ size = 128, className = "" }: AIAssistantIconProps) {
  // The SVG viewBox is 200x200 — large enough for the sparkles to orbit outside
  // the bubble without clipping. The bubble sits centered-right; sparkles orbit
  // around the upper-left of the bubble.
  return (
    <span
      className={`ai-assistant-icon-wrapper inline-block align-middle ${className}`}
      style={{ width: size, height: size, lineHeight: 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", display: "block" }}
      >
        {/* ============================================================
            DEFS — gradients (animated stops) + glow filter
            ============================================================ */}
        <defs>
          {/* Main flowing gradient for the bubble border.
              The animated <animate> shifts the x1/y1/x2/y2 to make the
              gradient flow around the outline. 5s per cycle, linear. */}
          <linearGradient id="ai-bubble-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED">
              <animate
                attributeName="offset"
                values="0;1;0"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="33%" stopColor="#00A8FF">
              <animate
                attributeName="offset"
                values="0.33;1.33;0.33"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="66%" stopColor="#6366F1">
              <animate
                attributeName="offset"
                values="0.66;1.66;0.66"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#00E5FF">
              <animate
                attributeName="offset"
                values="1;2;1"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          {/* Large sparkle gradient (purple → blue → cyan) */}
          <linearGradient id="ai-sparkle-large-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F00FF" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>

          {/* Small sparkle gradient (magenta → pink) */}
          <linearGradient id="ai-sparkle-small-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF007F" />
            <stop offset="100%" stopColor="#FF66C4" />
          </linearGradient>

          {/* Soft neon glow filter — purple/blue/cyan halo */}
          <filter id="ai-bubble-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="6" in="SourceGraphic" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Stronger glow on hover (applied via CSS class) */}
          <filter id="ai-bubble-glow-hover" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="10" in="SourceGraphic" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip path for the white inner area (so the breathing scale
              stays within the bubble border). */}
          <clipPath id="ai-bubble-clip">
            <path d="M 56 56
                     Q 56 40 72 40
                     L 138 40
                     Q 154 40 154 56
                     L 154 116
                     Q 154 132 138 132
                     L 110 132
                     L 96 152
                     L 92 132
                     L 72 132
                     Q 56 132 56 116
                     Z" />
          </clipPath>
        </defs>

        {/* ============================================================
            ROOT GROUP — idle floating animation (translateY 0 → -3 → 0)
            ============================================================ */}
        <g className="ai-icon-float" style={{ transformOrigin: "center" }}>
          {/* ============================================================
              SPARKLES — drawn BEHIND the bubble so the bubble's white
              interior stays clean. They orbit around their respective
              centers (60, 80) for the large one and (45, 50) for the
              small one — both in the upper-left area of the bubble.

              Structure: outer <g transform="translate(cx, cy)"> moves the
              orbit center to (cx, cy). Inside, the .ai-sparkle-* group
              applies the orbit animation: rotate(θ) translate(r, 0)
              rotate(-θ), which traces a circle of radius r around the
              outer translate point. The counter-rotation keeps the
              sparkle's own orientation stable (it orbits but doesn't
              spin). The .ai-sparkle-*-inner group applies the twinkle
              (scale + opacity).
              ============================================================ */}
          {/* Large sparkle — orbits clockwise around (60, 80), radius 28 */}
          <g transform="translate(60, 80)">
            <g className="ai-sparkle-large">
              <g className="ai-sparkle-large-inner">
                {/* Four-point star path (concave edges) centered at (0,0) */}
                <path
                  d="M 0 -22
                     C 4 -8 8 -4 22 0
                     C 8 4 4 8 0 22
                     C -4 8 -8 4 -22 0
                     C -8 -4 -4 -8 0 -22
                     Z"
                  fill="url(#ai-sparkle-large-gradient)"
                  filter="url(#ai-bubble-glow)"
                />
              </g>
            </g>
          </g>

          {/* Small sparkle — orbits anti-clockwise around (45, 50), radius 22 */}
          <g transform="translate(45, 50)">
            <g className="ai-sparkle-small">
              <g className="ai-sparkle-small-inner">
                <path
                  d="M 0 -11
                     C 2 -4 4 -2 11 0
                     C 4 2 2 4 0 11
                     C -2 4 -4 2 -11 0
                     C -4 -2 -2 -4 0 -11
                     Z"
                  fill="url(#ai-sparkle-small-gradient)"
                  filter="url(#ai-bubble-glow)"
                />
              </g>
            </g>
          </g>

          {/* ============================================================
              CHAT BUBBLE — gradient border (flowing) + white interior
              ============================================================ */}
          <g className="ai-bubble-group">
            {/* Bubble outline (stroke = flowing gradient) */}
            <path
              d="M 56 56
                 Q 56 40 72 40
                 L 138 40
                 Q 154 40 154 56
                 L 154 116
                 Q 154 132 138 132
                 L 110 132
                 L 96 152
                 L 92 132
                 L 72 132
                 Q 56 132 56 116
                 Z"
              fill="#FFFFFF"
              stroke="url(#ai-bubble-gradient)"
              strokeWidth="7"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#ai-bubble-glow)"
            />

            {/* Inner white area — breathing animation (scale 1 ↔ 0.96 ↔ 1.02) */}
            <g clipPath="url(#ai-bubble-clip)">
              <g className="ai-bubble-inner" style={{ transformOrigin: "105px 86px" }}>
                {/* White interior fill (slightly larger than the clip to allow scaling) */}
                <rect x="40" y="30" width="130" height="120" fill="#FFFFFF" />

                {/* Three gray message lines */}
                {/* Line 1 (top, longest) */}
                <rect
                  x="68" y="62"
                  width="74" height="9"
                  rx="4.5" ry="4.5"
                  fill="#A8A8B3"
                  className="ai-msg-line ai-msg-line-1"
                  style={{ transformOrigin: "105px 66.5px" }}
                />
                {/* Line 2 (bottom-left, medium) */}
                <rect
                  x="68" y="80"
                  width="46" height="9"
                  rx="4.5" ry="4.5"
                  fill="#A8A8B3"
                  className="ai-msg-line ai-msg-line-2"
                  style={{ transformOrigin: "91px 84.5px" }}
                />
                {/* Line 3 (bottom-right, medium) */}
                <rect
                  x="120" y="80"
                  width="32" height="9"
                  rx="4.5" ry="4.5"
                  fill="#A8A8B3"
                  className="ai-msg-line ai-msg-line-3"
                  style={{ transformOrigin: "136px 84.5px" }}
                />
              </g>
            </g>

            {/* Optional internal light sweep — a soft cyan highlight that
                travels across the gradient outline every ~6s. Implemented as
                a moving semi-transparent stripe clipped to the bubble path. */}
            <g
              className="ai-light-sweep"
              style={{ opacity: 0, mixBlendMode: "screen" }}
            >
              <path
                d="M 56 56
                   Q 56 40 72 40
                   L 138 40
                   Q 154 40 154 56
                   L 154 116
                   Q 154 132 138 132
                   L 110 132
                   L 96 152
                   L 92 132
                   L 72 132
                   Q 56 132 56 116
                   Z"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="9"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.55"
              />
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

        /* ===== Root floating animation (3.4s) ===== */
        .ai-icon-float {
          animation: ai-float 3.4s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes ai-float {
          0%   { transform: translateY(0); }
          50%  { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }

        /* ===== Flowing gradient border — handled by SMIL <animate> on stops
               (no CSS needed; the offsets animate continuously, 5s linear) ===== */

        /* ===== Large sparkle — orbit clockwise (6s) =====
               The outer <g transform="translate(60, 80)"> (in the SVG markup)
               moves the orbit center to (60, 80) in the SVG coordinate system.
               The .ai-sparkle-large group then applies the orbit animation:
                 rotate(θ) translateX(r) rotate(-θ)
               which traces a circle of radius r around the parent translate
               point. The counter-rotation keeps the sparkle's own
               orientation stable (it orbits but doesn't spin chaotically).
               Radius 14px keeps the orbit in the upper-left area of the
               icon, per the user spec ("orbit around the upper area of
               the chat icon", "small curved/orbital path"). */
        .ai-sparkle-large {
          animation: ai-orbit-cw 6s linear infinite;
          will-change: transform;
        }
        @keyframes ai-orbit-cw {
          0%   { transform: rotate(0deg)   translateX(14px) rotate(0deg); }
          25%  { transform: rotate(90deg)  translateX(14px) rotate(-90deg); }
          50%  { transform: rotate(180deg) translateX(14px) rotate(-180deg); }
          75%  { transform: rotate(270deg) translateX(14px) rotate(-270deg); }
          100% { transform: rotate(360deg) translateX(14px) rotate(-360deg); }
        }
        /* Twinkle for the large sparkle (2.5s, subtle scale + opacity) */
        .ai-sparkle-large-inner {
          animation: ai-twinkle-large 2.5s ease-in-out infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }
        @keyframes ai-twinkle-large {
          0%   { transform: scale(0.92); opacity: 0.85; }
          50%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(0.92); opacity: 0.85; }
        }

        /* ===== Small sparkle — orbit anti-clockwise (4.5s) =====
               Orbit center (45, 50) via outer <g transform="translate(45, 50)">.
               Radius 10px. */
        .ai-sparkle-small {
          animation: ai-orbit-ccw 4.5s linear infinite;
          will-change: transform;
        }
        @keyframes ai-orbit-ccw {
          0%   { transform: rotate(0deg)    translateX(10px) rotate(0deg); }
          25%  { transform: rotate(-90deg)  translateX(10px) rotate(90deg); }
          50%  { transform: rotate(-180deg) translateX(10px) rotate(180deg); }
          75%  { transform: rotate(-270deg) translateX(10px) rotate(270deg); }
          100% { transform: rotate(-360deg) translateX(10px) rotate(360deg); }
        }
        .ai-sparkle-small-inner {
          animation: ai-twinkle-small 1.8s ease-in-out infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }
        @keyframes ai-twinkle-small {
          0%   { transform: scale(0.94); opacity: 0.8; }
          50%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(0.94); opacity: 0.8; }
        }

        /* ===== Inner white area — subtle breathing (3.2s) ===== */
        .ai-bubble-inner {
          animation: ai-breathe 3.2s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes ai-breathe {
          0%   { transform: scale(1); }
          33%  { transform: scale(0.96); }
          66%  { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        /* ===== Gray message lines — subtle sequential pulse (3.2s, staggered) ===== */
        .ai-msg-line {
          animation: ai-msg-pulse 3.2s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .ai-msg-line-1 { animation-delay: 0s; }
        .ai-msg-line-2 { animation-delay: 0.4s; }
        .ai-msg-line-3 { animation-delay: 0.8s; }
        @keyframes ai-msg-pulse {
          0%   { transform: scale(1);    opacity: 1; }
          50%  { transform: scale(0.97); opacity: 0.78; }
          100% { transform: scale(1);    opacity: 1; }
        }

        /* ===== Optional internal light sweep — a soft cyan highlight
               that briefly travels across the border every 7s. ===== */
        .ai-light-sweep {
          animation: ai-sweep 7s ease-in-out infinite;
          will-change: opacity, transform;
          transform-origin: 105px 86px;
        }
        @keyframes ai-sweep {
          0%, 100% { opacity: 0; transform: translateX(-30px); }
          45%      { opacity: 0; transform: translateX(-30px); }
          50%      { opacity: 0.7; transform: translateX(0); }
          55%      { opacity: 0; transform: translateX(30px); }
        }

        /* ===== HOVER (desktop only — :hover applies to the wrapper,
               the icon scales 1.06 and sparkles brighten) ===== */
        @media (hover: hover) {
          .ai-assistant-icon-wrapper:hover .ai-icon-float {
            animation: ai-float 3.4s ease-in-out infinite, ai-hover-scale 0.4s ease forwards;
          }
          @keyframes ai-hover-scale {
            to { transform: translateY(-3px) scale(1.06); }
          }
          .ai-assistant-icon-wrapper:hover .ai-sparkle-large-inner {
            filter: brightness(1.25);
          }
          .ai-assistant-icon-wrapper:hover .ai-sparkle-small-inner {
            filter: brightness(1.25);
          }
          .ai-assistant-icon-wrapper:hover .ai-bubble-group {
            filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.45))
                    drop-shadow(0 0 14px rgba(0, 168, 255, 0.35));
          }
        }

        /* ===== ACTIVE (tap/click) — quick 0.94 → 1 squash ===== */
        .ai-assistant-icon-wrapper:active .ai-icon-float {
          animation: ai-float 3.4s ease-in-out infinite, ai-tap 0.3s ease;
        }
        @keyframes ai-tap {
          0%   { transform: scale(1); }
          50%  { transform: scale(0.94); }
          100% { transform: scale(1); }
        }

        /* ===== Accessibility — prefers-reduced-motion ===== */
        @media (prefers-reduced-motion: reduce) {
          .ai-icon-float,
          .ai-sparkle-large,
          .ai-sparkle-large-inner,
          .ai-sparkle-small,
          .ai-sparkle-small-inner,
          .ai-bubble-inner,
          .ai-msg-line,
          .ai-light-sweep {
            animation: none !important;
          }
          /* Keep the static icon visually attractive */
          .ai-assistant-icon-wrapper:hover .ai-icon-float,
          .ai-assistant-icon-wrapper:active .ai-icon-float {
            animation: none !important;
          }
        }
      `}</style>
    </span>
  );
}
