// ============================================================
// RUNNER GAME 2.0 — responsive (desktop + mobile)
// Driller stays in the SAME position before and after pressing space/tapping.
// Before: standing on the horizon, "GREAT THINGS TAKE TIME" below.
// After start: driller jumps in place, ground scrolls, shrines appear.
//
// Sizes, speeds and spawn spacing scale down on narrow screens — otherwise a
// phone-width area makes obstacles reach the player in a fraction of a second
// (unplayable). A grace distance also delays the first obstacle so the game
// never insta-kills on start.
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

// Desktop reference values; scaled per-device in buildConfig().
function buildConfig() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const mobile = w < 640;
  const s = mobile ? 0.66 : 1; // size scale

  return {
    mobile,
    PLAYER_WIDTH: Math.round(130 * s),
    PLAYER_HEIGHT: Math.round(95 * s),
    PLAYER_X: mobile ? 28 : 80,

    GROUND_HEIGHT: 2,
    GAME_HEIGHT: mobile ? 300 : 380,

    // Jump: match the DESKTOP feel. Hang time is 2·v/g; scaling BOTH gravity
    // and jump-velocity by the same factor (0.79 ≈ the 300/380 height ratio)
    // keeps the hang time identical to desktop while the arc's apex scales to
    // the shorter mobile area. (Raising gravity alone — as before — made the
    // jump snappy and short, which is what felt wrong.)
    GRAVITY: mobile ? 1232 : 1560,
    JUMP_VELOCITY: mobile ? 672 : 850,

    // Slower on mobile so a narrow track is still dodgeable.
    BASE_SPEED: mobile ? 200 : 320,
    MAX_SPEED: mobile ? 360 : 600,
    SPEED_RAMP_PER_SEC: 1.5,

    OBSTACLE_WIDTH: Math.round(140 * s),
    OBSTACLE_HEIGHT: Math.round(70 * s),
    // Distance the player has already covered before the FIRST obstacle can
    // appear — guarantees reaction time on every screen width.
    FIRST_OBSTACLE_GRACE: mobile ? 260 : 420,
    MIN_OBSTACLE_DISTANCE: mobile ? 430 : 650,
    MAX_OBSTACLE_DISTANCE: mobile ? 720 : 1100,

    COLLECTIBLE_SIZE: Math.round(40 * s),
    COLLECTIBLE_MIN_GAP_MS: 1800,
    COLLECTIBLE_MAX_GAP_MS: 4000,
    COLLECTIBLE_MIN_Y: mobile ? 110 : 160,
    COLLECTIBLE_MAX_Y: mobile ? 175 : 240,
  };
}

function RunnerGame2() {
  const { lang } = useLanguage();

  // Config is fixed for the component's life (recomputing mid-game would jump
  // the player); it reflects the screen size at mount.
  const C = useMemo(() => buildConfig(), []);
  const isTouch = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
    []
  );

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [announce, setAnnounce] = useState(''); // polite live-region text
  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const gameAreaRef = useRef(null);
  const playerYRef = useRef(0);
  const playerVelocityRef = useRef(0);
  const playerElRef = useRef(null);
  const obstaclesRef = useRef([]);
  const collectiblesRef = useRef([]);
  const speedRef = useRef(C.BASE_SPEED);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);

  const nextObstacleGapRef = useRef(C.MIN_OBSTACLE_DISTANCE);
  const nextCollectibleAtRef = useRef(0);
  const lastFrameRef = useRef(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);

  const [, forceRender] = useState(0);
  const requestRender = () => forceRender((n) => n + 1);

  const jump = () => {
    if (!started || gameOver) return;
    if (playerYRef.current <= 0.1) {
      playerVelocityRef.current = C.JUMP_VELOCITY;
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        if (gameOver) { restart(); return; }
        if (!started) {
          startGame();
          playerVelocityRef.current = C.JUMP_VELOCITY;
          return;
        }
        jump();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, gameOver]);

  const handleTap = () => {
    if (gameOver) { restart(); return; }
    if (!started) {
      startGame();
      playerVelocityRef.current = C.JUMP_VELOCITY;
      return;
    }
    jump();
  };

  // ===== GAME LOOP =====
  useEffect(() => {
    if (!started || gameOver) return;

    const tick = (now) => {
      const area = gameAreaRef.current;
      if (!area) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      // Paused: hold the frame (keep state + speed), don't advance the world.
      if (pausedRef.current) {
        lastFrameRef.current = now;
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!startTimeRef.current) startTimeRef.current = now;
      const dt = lastFrameRef.current ? (now - lastFrameRef.current) / 1000 : 0;
      lastFrameRef.current = now;

      const areaWidth = area.clientWidth;
      const groundY = C.GAME_HEIGHT - C.GROUND_HEIGHT;

      const elapsed = (now - startTimeRef.current) / 1000;
      speedRef.current = Math.min(C.MAX_SPEED, C.BASE_SPEED + elapsed * C.SPEED_RAMP_PER_SEC);

      distanceRef.current += speedRef.current * dt;
      const newScore = Math.floor(distanceRef.current / 10);
      if (newScore !== scoreRef.current) {
        scoreRef.current = newScore;
        setScore(newScore);
      }

      // Player physics
      playerVelocityRef.current -= C.GRAVITY * dt;
      playerYRef.current += playerVelocityRef.current * dt;
      if (playerYRef.current < 0) {
        playerYRef.current = 0;
        playerVelocityRef.current = 0;
      }

      if (playerElRef.current) {
        playerElRef.current.style.transform =
          `translate3d(${C.PLAYER_X}px, ${groundY - C.PLAYER_HEIGHT - playerYRef.current}px, 0)`;
      }

      // Spawn obstacles (distance-based). The first one waits for the grace
      // distance so the player is never hit before they can react.
      const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
      const canSpawn = lastObstacle
        ? (areaWidth - lastObstacle.x) >= nextObstacleGapRef.current
        : distanceRef.current >= C.FIRST_OBSTACLE_GRACE;
      if (canSpawn) {
        obstaclesRef.current.push({ id: now + Math.random(), x: areaWidth + 20 });
        nextObstacleGapRef.current =
          C.MIN_OBSTACLE_DISTANCE + Math.random() * (C.MAX_OBSTACLE_DISTANCE - C.MIN_OBSTACLE_DISTANCE);
      }

      // Spawn collectibles
      if (now > nextCollectibleAtRef.current) {
        collectiblesRef.current.push({
          id: now + Math.random(),
          x: areaWidth + 20,
          y: C.COLLECTIBLE_MIN_Y + Math.random() * (C.COLLECTIBLE_MAX_Y - C.COLLECTIBLE_MIN_Y),
        });
        nextCollectibleAtRef.current =
          now + C.COLLECTIBLE_MIN_GAP_MS +
          Math.random() * (C.COLLECTIBLE_MAX_GAP_MS - C.COLLECTIBLE_MIN_GAP_MS);
      }

      // Collision detection
      const playerLeft = C.PLAYER_X;
      const playerRight = C.PLAYER_X + C.PLAYER_WIDTH;
      const playerBottom = groundY - playerYRef.current;
      const playerTop = playerBottom - C.PLAYER_HEIGHT;

      let hitObstacle = false;
      const survivingObstacles = [];
      for (const obs of obstaclesRef.current) {
        obs.x -= speedRef.current * dt;
        const obsLeft = obs.x + 12;
        const obsRight = obs.x + C.OBSTACLE_WIDTH - 12;
        const obsTop = groundY - C.OBSTACLE_HEIGHT + 8;
        const obsBottom = groundY;
        if (
          playerRight > obsLeft &&
          playerLeft < obsRight &&
          playerBottom > obsTop &&
          playerTop < obsBottom
        ) {
          hitObstacle = true;
        }
        if (obs.x + C.OBSTACLE_WIDTH > 0) survivingObstacles.push(obs);
      }
      obstaclesRef.current = survivingObstacles;

      let collected = 0;
      const survivingCollectibles = [];
      for (const c of collectiblesRef.current) {
        c.x -= speedRef.current * dt;
        if (
          playerRight > c.x &&
          playerLeft < c.x + C.COLLECTIBLE_SIZE &&
          playerBottom > c.y &&
          playerTop < c.y + C.COLLECTIBLE_SIZE
        ) {
          collected += 1;
          continue;
        }
        if (c.x + C.COLLECTIBLE_SIZE > 0) survivingCollectibles.push(c);
      }
      collectiblesRef.current = survivingCollectibles;
      if (collected) distanceRef.current += collected * 500;

      if (hitObstacle) {
        setGameOver(true);
        setHighScore((h) => Math.max(h, scoreRef.current));
        setAnnounce(
          lang === 'ar'
            ? `انتهت اللعبة. النتيجة النهائية ${scoreRef.current}.`
            : `Game over. Final score ${scoreRef.current}.`
        );
        return;
      }

      requestRender();
      animationRef.current = requestAnimationFrame(tick);
    };

    lastFrameRef.current = 0;
    startTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, gameOver]);

  const startGame = () => {
    playerYRef.current = 0;
    playerVelocityRef.current = 0;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    scoreRef.current = 0;
    distanceRef.current = 0;
    speedRef.current = C.BASE_SPEED;
    nextObstacleGapRef.current = C.MIN_OBSTACLE_DISTANCE;
    nextCollectibleAtRef.current = 0;
    startTimeRef.current = 0;
    setScore(0);
    setPaused(false);
    setStarted(true);
    setAnnounce(lang === 'ar' ? 'بدأت اللعبة.' : 'Game started.');
  };

  const togglePause = () => {
    if (!started || gameOver) return;
    setPaused((p) => {
      const next = !p;
      setAnnounce(next ? (lang === 'ar' ? 'أُوقفت مؤقتاً.' : 'Paused.') : (lang === 'ar' ? 'استؤنفت.' : 'Resumed.'));
      return next;
    });
  };

  const restart = () => {
    setGameOver(false);
    startGame();
  };

  const labels = lang === 'ar' ? {
    prestartTitle: 'الأشياء العظيمة تحتاج وقتاً',
    prestartSub: isTouch ? 'بسسس، في هذه الأثناء انقر للّعب' : 'بسسس، في هذه الأثناء جرّب الضغط على المسافة',
    score: 'النتيجة',
    highScore: 'الأعلى',
    gameOver: 'انتهت اللعبة',
    finalScore: 'النتيجة النهائية',
    playAgain: 'العب مرة أخرى',
    tapHint: 'انقر للقفز',
    pause: 'إيقاف مؤقت',
    resume: 'استئناف',
    areaLabel: 'لعبة مصغّرة اختيارية: العدّاء. اضغط مسافة أو Enter أو انقر للبدء والقفز.',
  } : {
    prestartTitle: 'Great things take time',
    prestartSub: isTouch ? 'Psst — tap to play' : 'Psst, in the meantime try pressing space',
    score: 'Score',
    highScore: 'Best',
    gameOver: 'Game Over',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    tapHint: 'Tap to jump',
    pause: 'Pause',
    resume: 'Resume',
    areaLabel: 'Optional runner mini-game. Press Space, Enter, or tap to start and jump.',
  };

  const groundY = C.GAME_HEIGHT - C.GROUND_HEIGHT;

  return (
    <div className="runner2">
      {/* HUD only during play */}
      <div className={`runner2__hud ${(!started || gameOver) ? 'runner2__hud--hidden' : ''}`}>
        <span>{labels.score}: <strong>{score}</strong></span>
        {highScore > 0 && <span>{labels.highScore}: <strong>{highScore}</strong></span>}
        {isTouch && started && !gameOver && <span className="runner2__taphint">{labels.tapHint}</span>}
        {started && !gameOver && (
          <button type="button" className="runner2__pause" onClick={togglePause} aria-pressed={paused}>
            {paused ? labels.resume : labels.pause}
          </button>
        )}
      </div>

      {/* Screen-reader announcements for start / pause / game-over. */}
      <div className="sr-only" aria-live="polite" role="status">{announce}</div>

      {/* Game area — a labelled, keyboard-operable control (Space/Enter/tap). */}
      <div
        className="runner2__area"
        ref={gameAreaRef}
        role="button"
        tabIndex={0}
        aria-label={labels.areaLabel}
        onClick={handleTap}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); handleTap(); }
          // Space is handled by the global keydown listener (start/jump).
        }}
        onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
        style={{ height: `${C.GAME_HEIGHT}px` }}
      >
        <div className="runner2__horizon" style={{ top: `${groundY}px` }} />

        {obstaclesRef.current.map((obs) => (
          <img
            key={obs.id}
            src="/images/shrine.png"
            alt=""
            className="runner2__obstacle"
            style={{
              transform: `translate3d(${obs.x}px, ${groundY - C.OBSTACLE_HEIGHT}px, 0)`,
              width: `${C.OBSTACLE_WIDTH}px`,
              height: `${C.OBSTACLE_HEIGHT}px`,
            }}
          />
        ))}

        {collectiblesRef.current.map((c) => (
          <img
            key={c.id}
            src="/images/logowhite.png"
            alt=""
            className="runner2__collectible"
            style={{
              transform: `translate3d(${c.x}px, ${c.y}px, 0)`,
              width: `${C.COLLECTIBLE_SIZE}px`,
              height: `${C.COLLECTIBLE_SIZE}px`,
            }}
          />
        ))}

        <img
          ref={playerElRef}
          src="/images/driller.png"
          alt="driller"
          className="runner2__player"
          style={{
            transform: `translate3d(${C.PLAYER_X}px, ${groundY - C.PLAYER_HEIGHT}px, 0)`,
            width: `${C.PLAYER_WIDTH}px`,
            height: `${C.PLAYER_HEIGHT}px`,
          }}
        />
      </div>

      {/* Headline below the game area */}
      <div className="runner2__prestart">
        <h2 className="runner2__prestart-title">{labels.prestartTitle}</h2>
        <p className="runner2__prestart-sub">{labels.prestartSub}</p>
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div className="runner2__overlay">
          <h2>{labels.gameOver}</h2>
          <p>{labels.finalScore}: <strong>{score}</strong></p>
          <button
            className="runner2__button"
            onClick={(e) => { e.stopPropagation(); restart(); }}
          >
            {labels.playAgain}
          </button>
        </div>
      )}
    </div>
  );
}

export default RunnerGame2;
