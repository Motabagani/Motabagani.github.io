import { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from "./LanguageProvider";
import "./HaaPour.css";

const A = (f) => `${import.meta.env.BASE_URL}haa/${f}`;
const POSES = [A("pose-1.png"), A("pose-2.png"), A("pose-3.png"), A("pose-4.png")];
const STREAM = A("stream.png");

/* Beats, in ms from the start of a pour cycle.
   pose 1 = upright, 2 & 3 = the tilt, 4 = poured (stream drawn in behind the rim). */
const ENTER = 620;   // mascot settles in on pose 1
const TILT = 150;    // hold per tilt frame
const POUR = 460;    // stream wipes from spout to finjan
const HOLD = 1500;   // rest on pose 4
const RETURN = 130;  // hold per frame on the way back up

export default function HaaPour({
  loop = false,
  once = true,
  onDone,
  label = true,
}) {
  const { lang } = useLanguage();
  const [ready, setReady] = useState(false);
  const [pose, setPose] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef([]);
  const at = useCallback((fn, ms) => timers.current.push(setTimeout(fn, ms)), []);

  /* preload so frames never pop */
  useEffect(() => {
    let alive = true;
    Promise.all(
      [...POSES, STREAM].map(
        (src) =>
          new Promise((res) => {
            const i = new Image();
            i.onload = i.onerror = res;
            i.src = src;
          })
      )
    ).then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const seen = once && sessionStorage.getItem("haa-pour") === "1";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      setDone(true);
      onDone?.();
      return;
    }
    if (once) sessionStorage.setItem("haa-pour", "1");
    document.body.style.overflow = "hidden";

    let t = 0;
    at(() => setEntered(true), 40);
    t += ENTER;

    const cycle = (start) => {
      let c = start;
      at(() => setPose(1), c);
      c += TILT;
      at(() => setPose(2), c);
      c += TILT;
      at(() => setPouring(true), c);
      c += POUR;
      at(() => {
        setPose(3);
        setPouring(false);
      }, c);
      c += HOLD;
      if (!loop) return c;
      at(() => setPose(2), c);
      c += RETURN;
      at(() => setPose(1), c);
      c += RETURN;
      at(() => setPose(0), c);
      c += RETURN + 600;
      return c;
    };

    t = cycle(t);

    if (loop) {
      const id = setInterval(() => cycle(0), t);
      timers.current.push(() => clearInterval(id));
      return () => cleanup();
    }

    at(() => setLeaving(true), t);
    at(() => {
      setDone(true);
      document.body.style.overflow = "";
      onDone?.();
    }, t + 620);

    return cleanup;

    function cleanup() {
      timers.current.forEach((x) =>
        typeof x === "function" ? x() : clearTimeout(x)
      );
      timers.current = [];
      document.body.style.overflow = "";
    }
  }, [ready, loop, once, onDone, at]);

  const skip = () => {
    if (done || leaving) return;
    timers.current.forEach((x) =>
      typeof x === "function" ? x() : clearTimeout(x)
    );
    timers.current = [];
    setLeaving(true);
    setTimeout(() => {
      setDone(true);
      document.body.style.overflow = "";
      onDone?.();
    }, 520);
  };

  useEffect(() => {
    if (loop || done) return;
    const h = () => skip();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [loop, done]);

  if (done) return null;

  return (
    <div
      className={`haa ${loop ? "haa--inline" : "haa--splash"} ${
        leaving ? "haa--out" : ""
      }`}
      onClick={loop ? undefined : skip}
      aria-hidden="true"
      role="presentation"
    >
      <div className={`haa__stage ${entered ? "haa__stage--in" : ""}`}>
        {POSES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="haa__pose"
            style={{ opacity: i === pose ? 1 : 0 }}
          />
        ))}
        <img
          src={STREAM}
          alt=""
          className={`haa__stream ${pouring ? "haa__stream--pour" : ""}`}
          style={{ "--pour-ms": `${POUR}ms` }}
        />
      </div>

      {label && (
        <div className="haa__mark" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
          {lang === "ar" ? "هاشم" : "Hashim"}
        </div>
      )}
    </div>
  );
}
