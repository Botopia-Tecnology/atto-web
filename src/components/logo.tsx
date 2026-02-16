import "./logo.css";

// Fader positions converted from shader coordinates to SVG space.
// xScale=0.704, yScale=0.336, scale=500, Y inverted for SVG.
const FADERS = [
  { x: -77.4, top: -31.9, bot: 8.4 },
  { x: -52.8, top: -52.9, bot: 37.8 },
  { x: -28.2, top: -53.8, bot: 53.8 },
  { x: 0, top: -44.5, bot: 73.1 },
  { x: 28.2, top: -56.3, bot: 44.5 },
  { x: 52.8, top: -56.3, bot: 37.8 },
  { x: 77.4, top: -30.2, bot: 13.4 },
];

const CIRCLE_R = 96;
const CAPSULE_W = 12.8;
const STEM_W = 1.2;

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-100 -100 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="logo-circle">
          <circle cx="0" cy="0" r={CIRCLE_R} />
        </clipPath>
      </defs>
      <g clipPath="url(#logo-circle)">
        {FADERS.map((f, i) => (
          <line
            key={`s${i}`}
            x1={f.x}
            y1={-CIRCLE_R}
            x2={f.x}
            y2={CIRCLE_R}
            stroke="white"
            strokeWidth={STEM_W}
            opacity={0.55}
          />
        ))}
        {FADERS.map((f, i) => (
          <line
            key={`c${i}`}
            x1={f.x}
            y1={f.top}
            x2={f.x}
            y2={f.bot}
            stroke="white"
            strokeWidth={CAPSULE_W}
            strokeLinecap="round"
            className="logo-capsule"
          />
        ))}
      </g>
    </svg>
  );
}
