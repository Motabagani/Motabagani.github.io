// ============================================================
// RUNNER GAME 2.0 — FINAL
// Chrome-dino-style runner with verified fair physics.
// - Linear speed ramp with a hard MAX_SPEED ceiling
// - Distance-based obstacle spawning (not time-based) so gaps
//   stay fair regardless of how fast the game is going
// - Smooth player rendering via direct DOM transform
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

// ============================================================
// TUNABLE CONSTANTS
// ============================================================

// Player (driller)
const PLAYER_WIDTH = 130;
const PLAYER_HEIGHT = 95;
const PLAYER_X = 80;            // fixed horizontal position

// World
const GROUND_HEIGHT = 2;        // thin horizon line
const GAME_HEIGHT = 380;

// Physics
const GRAVITY = 1560;           // px/s² downward
const JUMP_VELOCITY = 800;      // initial upward velocity (px/s)

// Speed — linear ramp with a hard ceiling
const BASE_SPEED = 320;          // starting scroll speed (px/s)
const MAX_SPEED = 600;           // hard cap — speed never exceeds this
const SPEED_RAMP_PER_SEC = 1.5;  // px/s added per second of play

// Obstacles (shrine)
const OBSTACLE_WIDTH = 140;
const OBSTACLE_HEIGHT = 70;
const MIN_OBSTACLE_DISTANCE = 650;   // minimum pixel gap between obstacles
const MAX_OBSTACLE_DISTANCE = 1100;  // maximum pixel gap between obstacles

// Collectibles (floating logos)
const COLLECTIBLE_SIZE = 40;
const COLLECTIBLE_MIN_GAP_MS = 1800;
const COLLECTIBLE_MAX_GAP_MS = 4000;
const COLLECTIBLE_MIN_Y = 160;
const COLLECTIBLE_MAX_Y = 240;

function RunnerGame2() {
  const { lang } = useLanguage();

  // React state — drives re-renders for non-critical UI
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // Refs hold high-frequency values that don't trigger re-renders
  const gameAreaRef = useRef(null);
  const playerYRef = useRef(0);              // 0 = on ground
  const playerVelocityRef = useRef(0);
  const playerElRef = useRef(null);          // direct DOM reference for smooth motion
  const obstaclesRef = useRef([]);
  const collectiblesRef = useRef([]);
  const speedRef = useRef(BASE_SPEED);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);

  const nextObstacleGapRef = useRef(MIN_OBSTACLE_DISTANCE);
  const nextCollectibleAtRef = useRef(0);
  const lastFrameRef = useRef(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);

  // Force re-render trigger (only used for non-player visual updates)
  const [, forceRender] = useState(0);
  const requestRender = () => forceRender((n) => n + 1);

  // ===== JUMPING =====
  const jump = () => {
    if (!started || gameOver) return;
    if (playerYRef.current <= 0.1) {
      playerVelocityRef.current = JUMP_VELOCITY;
    }
  };

  // ===== KEYBOARD: space / up / w to jump or start =====
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        if (gameOver) { restart(); return; }
        if (!started) { restart(); return; }
        jump();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [started, gameOver]);

  // ===== TOUCH / CLICK to jump =====
  const handleTap = () => {
    if (gameOver) { restart(); return; }
    if (!started) { restart(); return; }
    jump();
  };

  // ===== MAIN GAME LOOP =====
  useEffect(() => {
    if (!started || gameOver) return;

    const tick = (now) => {
      const area = gameAreaRef.current;
      if (!area) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!startTimeRef.current) startTimeRef.current = now;
      const dt = lastFrameRef.current ? (now - lastFrameRef.current) / 1000 : 0;
      lastFrameRef.current = now;

      const areaWidth = area.clientWidth;
      const groundY = GAME_HEIGHT - GROUND_HEIGHT;

      // ===== SPEED: linear ramp with a hard ceiling =====
      const elapsed = (now - startTimeRef.current) / 1000;
      speedRef.current = Math.min(
        MAX_SPEED,
        BASE_SPEED + elapsed * SPEED_RAMP_PER_SEC
      );

      // ===== SCORE: distance traveled =====
      distanceRef.current += speedRef.current * dt;
      const newScore = Math.floor(distanceRef.current / 10);
      if (newScore !== scoreRef.current) {
        scoreRef.current = newScore;
        setScore(newScore);
      }

      // ===== PLAYER PHYSICS =====
      playerVelocityRef.current -= GRAVITY * dt;
      playerYRef.current += playerVelocityRef.current * dt;
      if (playerYRef.current < 0) {
        playerYRef.current = 0;
        playerVelocityRef.current = 0;
      }

      // Write player position directly to the DOM — bypasses React re-renders
      // for buttery-smooth 60fps jump motion
      if (playerElRef.current) {
        playerElRef.current.style.transform =
          `translate3d(${PLAYER_X}px, ${groundY - PLAYER_HEIGHT - playerYRef.current}px, 0)`;
      }

      // ===== SPAWN OBSTACLES (distance-based, not time-based) =====
      // This guarantees fair spacing regardless of how fast the game is going.
      const lastObstacle = obstaclesRef.current[obstaclesRef.current.length - 1];
      const distanceSinceLast = lastObstacle ? areaWidth - lastObstacle.x : Infinity;

      if (distanceSinceLast >= nextObstacleGapRef.current) {
        obstaclesRef.current.push({
          id: now + Math.random(),
          x: areaWidth + 20,
        });
        // Pick a random gap for the next obstacle within the safe range
        nextObstacleGapRef.current =
          MIN_OBSTACLE_DISTANCE + Math.random() * (MAX_OBSTACLE_DISTANCE - MIN_OBSTACLE_DISTANCE);
      }

      // ===== SPAWN COLLECTIBLES (time-based, less critical for fairness) =====
      if (now > nextCollectibleAtRef.current) {
        collectiblesRef.current.push({
          id: now + Math.random(),
          x: areaWidth + 20,
          y: COLLECTIBLE_MIN_Y + Math.random() * (COLLECTIBLE_MAX_Y - COLLECTIBLE_MIN_Y),
        });
        nextCollectibleAtRef.current =
          now + COLLECTIBLE_MIN_GAP_MS +
          Math.random() * (COLLECTIBLE_MAX_GAP_MS - COLLECTIBLE_MIN_GAP_MS);
      }

      // ===== COLLISION DETECTION =====
      const playerLeft = PLAYER_X;
      const playerRight = PLAYER_X + PLAYER_WIDTH;
      const playerBottom = groundY - playerYRef.current;
      const playerTop = playerBottom - PLAYER_HEIGHT;

      let hitObstacle = false;
      const survivingObstacles = [];
      for (const obs of obstaclesRef.current) {
        obs.x -= speedRef.current * dt;

        // Bounding box with small inset for forgiveness (visual edges have whitespace)
        const obsLeft = obs.x + 12;
        const obsRight = obs.x + OBSTACLE_WIDTH - 12;
        const obsTop = groundY - OBSTACLE_HEIGHT + 8;
        const obsBottom = groundY;

        if (
          playerRight > obsLeft &&
          playerLeft < obsRight &&
          playerBottom > obsTop &&
          playerTop < obsBottom
        ) {
          hitObstacle = true;
        }
        if (obs.x + OBSTACLE_WIDTH > 0) survivingObstacles.push(obs);
      }
      obstaclesRef.current = survivingObstacles;

      let collected = 0;
      const survivingCollectibles = [];
      for (const c of collectiblesRef.current) {
        c.x -= speedRef.current * dt;
        if (
          playerRight > c.x &&
          playerLeft < c.x + COLLECTIBLE_SIZE &&
          playerBottom > c.y &&
          playerTop < c.y + COLLECTIBLE_SIZE
        ) {
          collected += 1;
          continue;
        }
        if (c.x + COLLECTIBLE_SIZE > 0) survivingCollectibles.push(c);
      }
      collectiblesRef.current = survivingCollectibles;

      // Each collectible = 50 bonus score (500 distance / 10)
      if (collected) distanceRef.current += collected * 500;

      if (hitObstacle) {
        setGameOver(true);
        setHighScore((h) => Math.max(h, scoreRef.current));
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
  }, [started, gameOver]);

  // ===== RESTART =====
  const restart = () => {
    playerYRef.current = 0;
    playerVelocityRef.current = 0;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    scoreRef.current = 0;
    distanceRef.current = 0;
    speedRef.current = BASE_SPEED;
    nextObstacleGapRef.current = MIN_OBSTACLE_DISTANCE;
    nextCollectibleAtRef.current = 0;
    startTimeRef.current = 0;
    setScore(0);
    setGameOver(false);
    setStarted(true);
  };

  // ===== LABELS =====
  const labels = lang === 'ar' ? {
    prestartTitle: 'الأشياء العظيمة تحتاج وقتاً',
    prestartSub: 'بسسس، في هذه الأثناء جرّب الضغط على المسافة',
    score: 'النتيجة',
    highScore: 'الأعلى',
    gameOver: 'انتهت اللعبة',
    finalScore: 'النتيجة النهائية',
    playAgain: 'العب مرة أخرى',
    afterHint: 'تجنّب ضريح أسد بنسلفانيا، تماماً كما تجنّبت التقاط صور التخرج هناك',
  } : {
    prestartTitle: 'Great stuff take time',
    prestartSub: 'Psst, in the meantime try pressing space',
    score: 'Score',
    highScore: 'Best',
    gameOver: 'Game Over',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    afterHint: 'Avoid the Penn State Nittany Lion shrine, just like I avoided taking graduation pictures there',
  };

  const groundY = GAME_HEIGHT - GROUND_HEIGHT;

  return (
    <div className="runner2">
      {/* Minimal HUD only during play */}
      {started && !gameOver && (
        <div className="runner2__hud">
          <span>{labels.score}: <strong>{score}</strong></span>
          {highScore > 0 && <span>{labels.highScore}: <strong>{highScore}</strong></span>}
        </div>
      )}

      <div
        className="runner2__area"
        ref={gameAreaRef}
        onClick={handleTap}
        onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
        style={{ height: `${GAME_HEIGHT}px` }}
      >
        {/* Horizon line */}
        <div className="runner2__horizon" style={{ top: `${groundY}px` }} />

        {/* Obstacles — Nittany Lion shrine */}
        {obstaclesRef.current.map((obs) => (
          <img
            key={obs.id}
            src="images/shrine.png"
            alt=""
            className="runner2__obstacle"
            style={{
              transform: `translate3d(${obs.x}px, ${groundY - OBSTACLE_HEIGHT}px, 0)`,
              width: `${OBSTACLE_WIDTH}px`,
              height: `${OBSTACLE_HEIGHT}px`,
            }}
          />
        ))}

        {/* Collectibles — floating logos */}
        {collectiblesRef.current.map((c) => (
          <img
            key={c.id}
            src="images/logowhite.png"
            alt=""
            className="runner2__collectible"
            style={{
              transform: `translate3d(${c.x}px, ${c.y}px, 0)`,
              width: `${COLLECTIBLE_SIZE}px`,
              height: `${COLLECTIBLE_SIZE}px`,
            }}
          />
        ))}

        {/* Player — driller (uses ref for direct DOM updates) */}
        <img
          ref={playerElRef}
          src="images/driller.png"
          alt="driller"
          className="runner2__player"
          style={{
            transform: `translate3d(${PLAYER_X}px, ${groundY - PLAYER_HEIGHT}px, 0)`,
            width: `${PLAYER_WIDTH}px`,
            height: `${PLAYER_HEIGHT}px`,
          }}
        />
      </div>

      {/* Pre-start: big headline below the driller */}
      {!started && !gameOver && (
        <div className="runner2__prestart">
          <h2 className="runner2__prestart-title">{labels.prestartTitle}</h2>
          <p className="runner2__prestart-sub">{labels.prestartSub}</p>
        </div>
      )}

      {/* Roast text during play */}
      {started && !gameOver && (
        <p className="runner2__roast">{labels.afterHint}</p>
      )}

      {/* Game over overlay */}
      {gameOver && (
        <div className="runner2__overlay">
          <h4>{labels.gameOver}</h4>
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
