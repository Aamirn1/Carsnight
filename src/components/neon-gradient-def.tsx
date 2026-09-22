/**
 * NeonGradientDef — renders a hidden SVG with a <linearGradient> definition
 * that can be referenced by any SVG icon via `stroke="url(#neon-gradient-stroke)"`
 * or `fill="url(#neon-gradient-fill)"`.
 *
 * Rendered once in the root layout so the gradient is available globally.
 * The gradient is the Electric Blue → Violet → Neon Magenta brand gradient:
 *   #00A8FF → #6366F1 → #8B5CF6 → #D946EF
 *
 * Icons that want the neon gradient should add the `icon-neon` class (which
 * sets stroke to url(#neon-gradient-stroke)) OR wrap themselves in a
 * `.icon-neon` parent.
 */
export function NeonGradientDef() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <linearGradient id="neon-gradient-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A8FF" />
          <stop offset="40%" stopColor="#6366F1" />
          <stop offset="70%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
        <linearGradient id="neon-gradient-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A8FF" />
          <stop offset="40%" stopColor="#6366F1" />
          <stop offset="70%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
