import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./SubwayDestinationSign.css";

const DEFAULT_PHRASES = [
  "CODING",
  "ECONOMICS",
  "GRAPHIC DESIGN",
  "HASHIM MOTABAGANI",
];

// 5x7 dot-matrix glyphs (LED destination-sign style). Any character without a
// glyph falls back to a blank space, so add letters here before using them in a
// phrase. Uppercase only.
const GLYPHS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};

function DotWord({ text, phase }) {
  let order = 0;

  return (
    <div className={`subway-destination subway-destination--${phase}`} aria-hidden="true">
      {text.toUpperCase().split("").map((character, characterIndex) => {
        const rows = GLYPHS[character] || GLYPHS[" "];
        const columns = rows[0].length;

        return (
          <span
            className="subway-glyph"
            style={{ "--columns": columns }}
            key={`${character}-${characterIndex}`}
          >
            {rows.flatMap((row, rowIndex) =>
              row.split("").map((pixel, columnIndex) => {
                const pixelOrder = order++;
                return (
                  <i
                    className={pixel === "1" ? "is-lit" : ""}
                    style={{ "--pixel-order": pixelOrder }}
                    key={`${rowIndex}-${columnIndex}`}
                  />
                );
              }),
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function SubwayDestinationSign({
  phrases = DEFAULT_PHRASES,
  holdTime = 2000,
  className = "",
  label,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState("steady");
  const screenRef = useRef(null);

  // Shrink the LED dots (via the --fit CSS variable) just enough that the current
  // phrase fits the fixed-width screen. Measuring with getBoundingClientRect at
  // --fit:1 is reliable in every browser (Safari's offset/scrollWidth on this
  // flex+grid content under-reported), and shrinking the real layout — rather
  // than a transform on an overflowing box — keeps the word centered and unclipped.
  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return undefined;
    const measure = () => {
      const dest = screen.querySelector(".subway-destination");
      if (!dest) return;
      dest.style.setProperty("--fit", "1"); // reset to read the true natural width
      const natural = dest.getBoundingClientRect().width;
      const styles = getComputedStyle(screen);
      const avail = screen.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
      // small inset so the text never kisses the screen edge.
      const ratio = natural > 0 ? Math.min(1, (avail - 10) / natural) : 1;
      dest.style.setProperty("--fit", String(ratio));
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(screen);
    window.addEventListener("resize", measure);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [activeIndex]);

  useEffect(() => {
    if (phrases.length < 2) return undefined;

    let swapTimer;
    let settleTimer;
    const interval = window.setInterval(() => {
      setPhase("out");
      swapTimer = window.setTimeout(() => {
        setActiveIndex((current) => (current + 1) % phrases.length);
        setPhase("in");
        settleTimer = window.setTimeout(() => setPhase("steady"), 420);
      }, 240);
    }, holdTime + 660);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(swapTimer);
      window.clearTimeout(settleTimer);
    };
  }, [holdTime, phrases]);

  const currentPhrase = phrases[activeIndex] || "";

  return (
    <section className={`subway-sign ${className}`.trim()} aria-label={label || `Areas of work: ${phrases.join(", ")}`}>
      <div className="subway-route" aria-hidden="true">
        <DotWord text="H" phase="steady" />
      </div>
      <div className="subway-screen" ref={screenRef}>
        <DotWord text={currentPhrase} phase={phase} />
      </div>
      <span className="subway-sr-only">{phrases.join(", ")}</span>
    </section>
  );
}
