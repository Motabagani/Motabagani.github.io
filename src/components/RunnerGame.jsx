import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

// ============================================================
// TUNABLE CONSTANTS — adjust to taste
// ============================================================
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 60;
const PLAYER_X = 100;            // fixed horizontal position
const GROUND_HEIGHT = 60;        // height of the lavender ground band
const GAME_HEIGHT = 380;

const GRAVITY = 2000;            // pixels per second squared
const JUMP_VELOCITY = 800;       // initial upward velocity when jumping

const BASE_SPEED = 320;          // initial scroll speed (px/sec)
const SPEED_RAMP = 0.04;         // how fast speed increases over time

const OBSTACLE_SIZE = 60;        // lion size
const COLLECTIBLE_SIZE = 40;     // logo size

// Spawn timing
const OBSTACLE_MIN_GAP = 1200;   // minimum ms between obstacles
const OBSTACLE_MAX_GAP = 2400;   // maximum ms between obstacles
const COLLECTIBLE_MIN_GAP = 1800;
const COLLECTIBLE_MAX_GAP = 4000;

// Collectibles float in the air at varying heights
const COLLECTIBLE_MIN_Y = 80;    // top edge
const COLLECTIBLE_MAX_Y = 200;   // bottom edge (still above ground)

function RunnerGame() {
  const { lang } = useLanguage();

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // Refs for the game loop (don't trigger re-renders)
  const gameAreaRef = useRef(null);
  const playerYRef = useRef(0);          // 0 = on ground, positive = up
  const playerVelocityRef = useRef(0);
  const playerElRef = useRef(null);
  const obstaclesRef = useRef([]);
  const collectiblesRef = useRef([]);
  const cloudsRef = useRef([]);
  const speedRef = useRef(BASE_SPEED);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);

  const nextObstacleAtRef = useRef(0);
  const nextCollectibleAtRef = useRef(0);
  const nextCloudAtRef = useRef(0);
  const lastFrameRef = useRef(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);

  const [, forceRender] = useState(0);
  const requestRender = () => forceRender((n) => n + 1);

  // ===== JUMPING =====
  // Only allow jump when player is on the ground
  const jump = () => {
    if (!started || gameOver) return;
    if (playerYRef.current <= 0.1) {
      playerVelocityRef.current = JUMP_VELOCITY;
    }
  };

  // ===== KEYBOARD: space/up to jump =====
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        if (!started || gameOver) {
          // Pressing space on the game over screen restarts
          if (gameOver) restart();
          else if (!started) restart();
          return;
        }
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

      // Speed gradually increases over time
      const elapsed = (now - startTimeRef.current) / 1000;
      speedRef.current = BASE_SPEED + elapsed * elapsed * SPEED_RAMP * 30;

      // Score = distance traveled / 10
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

      // Write player position directly to the DOM — bypasses React re-renders for buttery-smooth motion
if (playerElRef.current) {
  const groundY = GAME_HEIGHT - GROUND_HEIGHT;
  playerElRef.current.style.transform =
    `translate3d(${PLAYER_X}px, ${groundY - PLAYER_HEIGHT - playerYRef.current}px, 0)`;
}

      // ===== SPAWN OBSTACLES =====
      if (now > nextObstacleAtRef.current) {
        obstaclesRef.current.push({
          id: now + Math.random(),
          x: areaWidth + 20,
        });
        const gap = OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
        // Make gap a bit shorter as speed increases for natural difficulty
        const speedFactor = BASE_SPEED / speedRef.current;
        nextObstacleAtRef.current = now + gap * speedFactor;
      }

      // ===== SPAWN COLLECTIBLES =====
      if (now > nextCollectibleAtRef.current) {
        collectiblesRef.current.push({
          id: now + Math.random(),
          x: areaWidth + 20,
          y: COLLECTIBLE_MIN_Y + Math.random() * (COLLECTIBLE_MAX_Y - COLLECTIBLE_MIN_Y),
        });
        nextCollectibleAtRef.current =
          now + COLLECTIBLE_MIN_GAP + Math.random() * (COLLECTIBLE_MAX_GAP - COLLECTIBLE_MIN_GAP);
      }

      // ===== SPAWN CLOUDS (decorative) =====
      if (now > nextCloudAtRef.current) {
        cloudsRef.current.push({
          id: now + Math.random(),
          x: areaWidth + 20,
          y: 20 + Math.random() * 100,
          size: 40 + Math.random() * 60,
          speed: 0.3 + Math.random() * 0.3, // slower than ground for parallax
        });
        nextCloudAtRef.current = now + 2000 + Math.random() * 3000;
      }

      // ===== MOVE OBSTACLES & DETECT COLLISIONS =====
      const playerLeft = PLAYER_X;
      const playerRight = PLAYER_X + PLAYER_WIDTH;
      const playerBottom = groundY - playerYRef.current;
      const playerTop = playerBottom - PLAYER_HEIGHT;

      let hitLion = false;
      const survivingObstacles = [];
      for (const obs of obstaclesRef.current) {
        obs.x -= speedRef.current * dt;
        // Collision check (with a little forgiveness — 10px inset)
        const obsLeft = obs.x + 8;
        const obsRight = obs.x + OBSTACLE_SIZE - 8;
        const obsTop = groundY - OBSTACLE_SIZE + 8;
        const obsBottom = groundY;
        if (
          playerRight > obsLeft &&
          playerLeft < obsRight &&
          playerBottom > obsTop &&
          playerTop < obsBottom
        ) {
          hitLion = true;
        }
        if (obs.x + OBSTACLE_SIZE > 0) survivingObstacles.push(obs);
      }
      obstaclesRef.current = survivingObstacles;

      // ===== MOVE COLLECTIBLES & DETECT PICKUPS =====
      let collected = 0;
      const survivingCollectibles = [];
      for (const c of collectiblesRef.current) {
        c.x -= speedRef.current * dt;
        const cLeft = c.x;
        const cRight = c.x + COLLECTIBLE_SIZE;
        const cTop = c.y;
        const cBottom = c.y + COLLECTIBLE_SIZE;
        if (
          playerRight > cLeft &&
          playerLeft < cRight &&
          playerBottom > cTop &&
          playerTop < cBottom
        ) {
          collected += 1;
          continue;
        }
        if (c.x + COLLECTIBLE_SIZE > 0) survivingCollectibles.push(c);
      }
      collectiblesRef.current = survivingCollectibles;
      if (collected) {
        // Each logo = 50 bonus points
        distanceRef.current += collected * 500;
      }

      // ===== MOVE CLOUDS =====
      const survivingClouds = [];
      for (const cloud of cloudsRef.current) {
        cloud.x -= speedRef.current * cloud.speed * dt;
        if (cloud.x + cloud.size > 0) survivingClouds.push(cloud);
      }
      cloudsRef.current = survivingClouds;

      if (hitLion) {
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

  const restart = () => {
    playerYRef.current = 0;
    playerVelocityRef.current = 0;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    cloudsRef.current = [];
    scoreRef.current = 0;
    distanceRef.current = 0;
    speedRef.current = BASE_SPEED;
    nextObstacleAtRef.current = 0;
    nextCollectibleAtRef.current = 0;
    nextCloudAtRef.current = 0;
    startTimeRef.current = 0;
    setScore(0);
    setGameOver(false);
    setStarted(true);
  };

  // ===== LABELS =====
  const labels = lang === 'ar' ? {
    title: 'الجري في الصحراء',
    instruction: 'اقفز فوق الأسود واجمع الشعارات',
    start: 'ابدأ',
    score: 'النتيجة',
    highScore: 'الأعلى',
    gameOver: 'انتهت اللعبة',
    finalScore: 'النتيجة النهائية',
    playAgain: 'العب مرة أخرى',
    controls: 'مسطرة المسافة، السهم العلوي، أو اللمس للقفز',
  } : {
    title: 'Desert Runner',
    instruction: 'Jump the lions, grab the logos',
    start: 'Start',
    score: 'Score',
    highScore: 'Best',
    gameOver: 'Game Over',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    controls: 'Space, up arrow, or tap to jump',
  };

  // Ground Y position in CSS
  const groundY = GAME_HEIGHT - GROUND_HEIGHT;

  return (
    <div className="runner-game">
      {started && (
        <div className="runner-game__header">
          <h3>{labels.title}</h3>
          <p className="runner-game__instruction">{labels.instruction}</p>
          <p className="runner-game__controls-hint">{labels.controls}</p>
        </div>
      )}

      {started && (
        <div className="runner-game__hud">
          <span>{labels.score}: <strong>{score}</strong></span>
          {highScore > 0 && <span>{labels.highScore}: <strong>{highScore}</strong></span>}
        </div>
      )}

      <div
        className="runner-game__area"
        ref={gameAreaRef}
        onClick={handleTap}
        onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
        style={{ height: `${GAME_HEIGHT}px` }}
        tabIndex={0}
      >
        {/* Sky gradient */}
        <div className="runner-game__sky" />

        {/* Clouds */}
        {cloudsRef.current.map((cloud) => (
          <div
            key={cloud.id}
            className="runner-game__cloud"
            style={{
              transform: `translate3d(${cloud.x}px, ${cloud.y}px, 0)`,
              width: `${cloud.size}px`,
              height: `${cloud.size * 0.4}px`,
            }}
          />
        ))}

        {/* Lavender ground band */}
        <div
          className="runner-game__ground"
          style={{ height: `${GROUND_HEIGHT}px` }}
        />

        {/* Obstacles (lions) */}
        {obstaclesRef.current.map((obs) => (
          <img
            key={obs.id}
            src="images/psu_logo.png"
            alt=""
            className="runner-game__obstacle"
            style={{
              transform: `translate3d(${obs.x}px, ${groundY - OBSTACLE_SIZE}px, 0)`,
              width: `${OBSTACLE_SIZE}px`,
              height: `${OBSTACLE_SIZE}px`,
            }}
          />
        ))}

        {/* Collectibles (logos) */}
        {collectiblesRef.current.map((c) => (
          <img
            key={c.id}
            src="images/logowhite.png"
            alt=""
            className="runner-game__collectible"
            style={{
              transform: `translate3d(${c.x}px, ${c.y}px, 0)`,
              width: `${COLLECTIBLE_SIZE}px`,
              height: `${COLLECTIBLE_SIZE}px`,
            }}
          />
        ))}

        {/* Player (driller) */}
        <img
  ref={playerElRef}
  src="images/driller.png"
  alt="driller"
  className="runner-game__player"
  style={{
    transform: `translate3d(${PLAYER_X}px, ${groundY - PLAYER_HEIGHT}px, 0)`,
    width: `${PLAYER_WIDTH}px`,
    height: `${PLAYER_HEIGHT}px`,
  }}
/>

        {/* Start / Game over overlay */}
        {!started && !gameOver && (
  <div className="runner-game__prestart">
    <img src="images/driller.png" alt="" className="runner-game__prestart-driller" />
    <h2 className="runner-game__prestart-title">
      {lang === 'ar' ? 'الأشياء العظيمة تحتاج وقتاً' : 'Great stuff takes time'}
    </h2>
    <p className="runner-game__prestart-sub">
      {lang === 'ar' ? 'في هذه الأثناء، جرّب الضغط على المسافة' : 'In the meantime, try pressing space'}
    </p>
  </div>
)}

        {gameOver && (
          <div className="runner-game__overlay">
            <h4>{labels.gameOver}</h4>
            <p>{labels.finalScore}: <strong>{score}</strong></p>
            <button className="runner-game__button" onClick={(e) => { e.stopPropagation(); restart(); }}>
              {labels.playAgain}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RunnerGame;
