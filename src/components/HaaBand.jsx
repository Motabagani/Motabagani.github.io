/* HaaBand — night skyline scene for the 403 page.
   Static (no audio for now): the skyline glowing on black, with a moon,
   twinkling stars, and a meteor streaking across. The artwork is in two
   layers so only the towers shine:
     - towers.png            → the skyline, gets the glow filter
     - trains and sign_.png  → the props (train + sign), NO glow
   Layer positions below are the offsets of each cropped layer within the
   original combined canvas (2789×1018), so they line up exactly. The band of
   Ha'a characters lands here later. */

const TOWERS = encodeURI('/images/towers.png');
const PROPS = encodeURI('/images/trains and sign_.png');

// Tower tips (as % of the scene box) — measured from the towers artwork.
// The tallest, on the left, is the WTC: its tip gets the red beacon.
const WTC = { left: 3.79, top: 13.6 };
// The other towers get small "corner" beacon lights on their tips.
const BEACONS = [
  { left: 14.16, top: 31.7 },
  { left: 66.54, top: 20.9 },
  { left: 71.91, top: 20.9 },
  { left: 79.06, top: 45.4 },
];

// Star field — generated once at module load (kept out of render so it's stable
// and doesn't trip the "no impure calls in render" rule).
const STARS = Array.from({ length: 70 }, () => ({
  x: Math.random() * 100,          // %
  y: Math.random() * 60,           // % (upper sky only)
  s: 0.8 + Math.random() * 2.2,    // px diameter
  dur: 2.2 + Math.random() * 3.8,  // s
  delay: Math.random() * 5,        // s
}));

export default function HaaBand() {
  return (
    <div className="haa-band" aria-label="City skyline at night">
      <div className="haa-band__moon" aria-hidden="true" />

      <div className="haa-band__stars" aria-hidden="true">
        {STARS.map((st, i) => (
          <span
            key={i}
            className="haa-band__star"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: `${st.s}px`,
              height: `${st.s}px`,
              animationDuration: `${st.dur}s`,
              animationDelay: `${st.delay}s`,
            }}
          />
        ))}
      </div>

      <span className="haa-band__meteor" aria-hidden="true" />

      <div className="haa-band__cityglow" aria-hidden="true" />

      {/* The skyline (towers + their tip beacons) — nudged as one group.
          Towers glow; the beacons ride along. */}
      <div className="haa-band__city" aria-hidden="true">
        <img
          className="haa-band__towers"
          src={TOWERS}
          alt="City skyline at night"
          style={{ left: '1.11%', top: '0%', width: '89.39%' }}
        />
        {/* WTC red beacon + warm corner lights on the other tips. */}
        <span
          className="haa-band__beacon haa-band__beacon--red"
          style={{ left: `${WTC.left}%`, top: `${WTC.top}%` }}
        />
        {BEACONS.map((b, i) => (
          <span
            key={i}
            className="haa-band__beacon"
            style={{ left: `${b.left}%`, top: `${b.top}%`, animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </div>

      {/* Props (train + sign) — sit in front, no glow, not shifted. */}
      <img
        className="haa-band__props"
        src={PROPS}
        alt=""
        style={{ left: '26.11%', top: '48.48%', width: '40.52%' }}
      />

      {/* Ground line running under the whole scene. */}
      <span className="haa-band__ground" aria-hidden="true" />
    </div>
  );
}
