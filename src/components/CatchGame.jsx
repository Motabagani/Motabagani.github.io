import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

// === Tunable constants ===
const PLAYER_WIDTH = 90;
const PLAYER_HEIGHT = 70;
const ITEM_SIZE = 50;
const SPAWN_RATE_MS = 800;
const LION_PROBABILITY = 0.3;
const BASE_FALL_SPEED = 180;        // pixels per second
const SPEED_RAMP_PER_POINT = 8;     // how much faster things fall per logo caught

function CatchGame() {
  const { lang } = useLanguage();

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // Refs hold values that don't trigger re-renders.
  // The game loop uses these for max performance.
  const gameAreaRef = useRef(null);
  const playerXRef = useRef(0);
  const itemsRef = useRef([]);
  const keysPressed = useRef({});
  const scoreRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(0);

  // For rendering — we use a "tick" counter to trigger re-renders only when needed
  const [, forceRender] = useState(0);
  const requestRender = () => forceRender((n) => n + 1);

  // ===== KEYBOARD INPUT =====
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keysPressed.current[e.key] = true;
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // ===== MOUSE / TOUCH MOVE =====
  const handlePointerMove = (clientX) => {
    if (!started || gameOver) return;
    const area = gameAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const maxX = area.clientWidth - PLAYER_WIDTH;
    playerXRef.current = Math.max(0, Math.min(maxX, relativeX - PLAYER_WIDTH / 2));
  };

  // ===== TAP TO STEP =====
  const handleClick = (clientX) => {
    if (!started || gameOver) return;
    const area = gameAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const middle = rect.left + area.clientWidth / 2;
    const step = 80;
    const maxX = area.clientWidth - PLAYER_WIDTH;
    playerXRef.current = clientX < middle
      ? Math.max(0, playerXRef.current - step)
      : Math.min(maxX, playerXRef.current + step);
  };

  // ===== MAIN GAME LOOP (requestAnimationFrame for smooth 60fps) =====
  useEffect(() => {
    if (!started || gameOver) return;

    const tick = (now) => {
      const area = gameAreaRef.current;
      if (!area) {
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      // Calculate time elapsed since last frame (in seconds)
      const dt = lastFrameRef.current ? (now - lastFrameRef.current) / 1000 : 0;
      lastFrameRef.current = now;

      // === Player keyboard movement ===
      const keySpeed = 480; // pixels per second
      const maxX = area.clientWidth - PLAYER_WIDTH;
      if (keysPressed.current['ArrowLeft']) {
        playerXRef.current = Math.max(0, playerXRef.current - keySpeed * dt);
      }
      if (keysPressed.current['ArrowRight']) {
        playerXRef.current = Math.min(maxX, playerXRef.current + keySpeed * dt);
      }

      // === Spawn items ===
      if (now - lastSpawnRef.current > SPAWN_RATE_MS) {
        const isLion = Math.random() < LION_PROBABILITY;
        itemsRef.current.push({
          id: now + Math.random(),
          x: Math.random() * (area.clientWidth - ITEM_SIZE),
          y: -ITEM_SIZE,
          speed: BASE_FALL_SPEED + scoreRef.current * SPEED_RAMP_PER_POINT,
          type: isLion ? 'lion' : 'logo',
        });
        lastSpawnRef.current = now;
      }

      // === Move items & detect collisions ===
      const areaHeight = area.clientHeight;
      const playerY = areaHeight - PLAYER_HEIGHT - 10;
      const px = playerXRef.current;
      const surviving = [];
      let hitLion = false;
      let logosCaught = 0;

      for (const item of itemsRef.current) {
        item.y += item.speed * dt;

        // Collision check (axis-aligned bounding box)
        const collidesY = item.y + ITEM_SIZE > playerY && item.y < playerY + PLAYER_HEIGHT;
        const collidesX = item.x + ITEM_SIZE > px && item.x < px + PLAYER_WIDTH;

        if (collidesY && collidesX) {
          if (item.type === 'lion') {
            hitLion = true;
          } else {
            logosCaught += 1;
          }
          continue; // remove item
        }
        if (item.y < areaHeight) surviving.push(item);
      }

      itemsRef.current = surviving;

      if (logosCaught) {
        scoreRef.current += logosCaught;
        setScore(scoreRef.current);
      }

      if (hitLion) {
        setGameOver(true);
        return; // stop the loop
      }

      requestRender();
      animationRef.current = requestAnimationFrame(tick);
    };

    lastFrameRef.current = 0;
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [started, gameOver]);

  // Center the player when the game starts
  useEffect(() => {
    if (started && !gameOver) {
      const area = gameAreaRef.current;
      if (area) playerXRef.current = (area.clientWidth - PLAYER_WIDTH) / 2;
    }
  }, [started, gameOver]);

  const restart = () => {
    scoreRef.current = 0;
    itemsRef.current = [];
    lastSpawnRef.current = 0;
    setScore(0);
    setGameOver(false);
    setStarted(true);
  };

  // ===== LABELS =====
  const labels = lang === 'ar' ? {
    title: 'لعبة الالتقاط',
    instruction: 'اجمع الشعار، تجنّب الأسد',
    start: 'ابدأ',
    score: 'النتيجة',
    gameOver: 'انتهت اللعبة',
    finalScore: 'النتيجة النهائية',
    playAgain: 'العب مرة أخرى',
    controls: 'الأسهم، الفأرة، أو اللمس',
  } : {
    title: 'Catch Game',
    instruction: 'Catch the logo, avoid the lion',
    start: 'Start',
    score: 'Score',
    gameOver: 'Game Over',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    controls: 'Arrow keys, mouse, or touch',
  };

  return (
    <div className="catch-game">
      <div className="catch-game__header">
        <h3>{labels.title}</h3>
        <p className="catch-game__instruction">{labels.instruction}</p>
        <p className="catch-game__controls-hint">{labels.controls}</p>
      </div>

      <div className="catch-game__hud">
        <span>{labels.score}: <strong>{score}</strong></span>
      </div>

      <div
        className="catch-game__area"
        ref={gameAreaRef}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            e.preventDefault();
            handlePointerMove(e.touches[0].clientX);
          }
        }}
        onClick={(e) => handleClick(e.clientX)}
      >
        {!started && !gameOver && (
          <div className="catch-game__overlay">
            <button className="catch-game__button" onClick={restart}>
              {labels.start}
            </button>
          </div>
        )}

        {gameOver && (
          <div className="catch-game__overlay">
            <h4>{labels.gameOver}</h4>
            <p>{labels.finalScore}: <strong>{score}</strong></p>
            <button className="catch-game__button" onClick={restart}>
              {labels.playAgain}
            </button>
          </div>
        )}

        {itemsRef.current.map((item) => (
          <img
            key={item.id}
            src={item.type === 'lion' ? '/images/psu_logo.png' : '/images/logowhite.png'}
            alt=""
            className={`catch-game__item catch-game__item--${item.type}`}
            style={{
              transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
              width: `${ITEM_SIZE}px`,
              height: `${ITEM_SIZE}px`,
            }}
          />
        ))}

        <img
          src="/images/driller.png"
          alt="driller"
          className="catch-game__player"
          style={{
            transform: `translate3d(${playerXRef.current}px, 0, 0)`,
            width: `${PLAYER_WIDTH}px`,
            height: `${PLAYER_HEIGHT}px`,
          }}
        />
      </div>
    </div>
  );
}

export default CatchGame;
