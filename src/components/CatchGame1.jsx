import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

// Tunable constants — change these to make the game easier or harder
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 60;
const ITEM_SIZE = 50;
const GAME_HEIGHT = 500;
const FALL_SPEED_MIN = 2;
const FALL_SPEED_MAX = 5;
const SPAWN_RATE_MS = 900;     // how often a new item appears
const LION_PROBABILITY = 0.35; // 35% of items are lions
const STARTING_LIVES = 3;

function CatchGame() {
  const { lang } = useLanguage();

  // Game state — useState triggers re-renders so the UI updates
  const [playerX, setPlayerX] = useState(0);       // pixels from left
  const [items, setItems] = useState([]);          // falling things
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  // Refs hold values that don't trigger re-renders (perf-critical for game loops)
  const gameAreaRef = useRef(null);
  const playerXRef = useRef(0);     // mirror of state for use inside intervals
  const itemsRef = useRef([]);
  const keysPressed = useRef({});

  // Sync refs with state
  useEffect(() => { playerXRef.current = playerX; }, [playerX]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // ===== INPUT: KEYBOARD =====
  useEffect(() => {
    if (!started || gameOver) return;

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
  }, [started, gameOver]);

  // Continuous movement loop driven by keys pressed
  useEffect(() => {
    if (!started || gameOver) return;
    const moveInterval = setInterval(() => {
      const area = gameAreaRef.current;
      if (!area) return;
      const maxX = area.clientWidth - PLAYER_WIDTH;
      const speed = 8;
      let newX = playerXRef.current;
      if (keysPressed.current['ArrowLeft']) newX -= speed;
      if (keysPressed.current['ArrowRight']) newX += speed;
      newX = Math.max(0, Math.min(maxX, newX));
      if (newX !== playerXRef.current) setPlayerX(newX);
    }, 16); // ~60fps
    return () => clearInterval(moveInterval);
  }, [started, gameOver]);

  // ===== INPUT: MOUSE & TOUCH =====
  // Both work the same way — track the X position and center the player there
  const handlePointerMove = (clientX) => {
    if (!started || gameOver) return;
    const area = gameAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const newX = Math.max(0, Math.min(area.clientWidth - PLAYER_WIDTH, relativeX - PLAYER_WIDTH / 2));
    setPlayerX(newX);
  };

  // ===== INPUT: TAP LEFT/RIGHT (click anywhere) =====
  const handlePointerClick = (clientX) => {
    if (!started || gameOver) return;
    const area = gameAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const middle = rect.left + area.clientWidth / 2;
    const step = 60;
    setPlayerX((prev) => {
      const maxX = area.clientWidth - PLAYER_WIDTH;
      const newX = clientX < middle ? prev - step : prev + step;
      return Math.max(0, Math.min(maxX, newX));
    });
  };

  // ===== ITEM SPAWNING =====
  useEffect(() => {
    if (!started || gameOver) return;
    const spawnInterval = setInterval(() => {
      const area = gameAreaRef.current;
      if (!area) return;
      const isLion = Math.random() < LION_PROBABILITY;
      const newItem = {
        id: Date.now() + Math.random(),
        x: Math.random() * (area.clientWidth - ITEM_SIZE),
        y: -ITEM_SIZE,
        speed: FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
        type: isLion ? 'lion' : 'logo',
      };
      setItems((prev) => [...prev, newItem]);
    }, SPAWN_RATE_MS);
    return () => clearInterval(spawnInterval);
  }, [started, gameOver]);

  // ===== GAME LOOP: falling items, collision detection =====
  useEffect(() => {
    if (!started || gameOver) return;

    const loop = setInterval(() => {
      const area = gameAreaRef.current;
      if (!area) return;
      const areaHeight = area.clientHeight;
      const playerY = areaHeight - PLAYER_HEIGHT - 10;
      const px = playerXRef.current;

      const surviving = [];
      let scoreChange = 0;
      let livesLost = 0;

      itemsRef.current.forEach((item) => {
        const newY = item.y + item.speed;
        const newItem = { ...item, y: newY };

        // Check collision with player
        const collidesX = newY + ITEM_SIZE > playerY && newY < playerY + PLAYER_HEIGHT;
        const overlapsX = item.x + ITEM_SIZE > px && item.x < px + PLAYER_WIDTH;

        if (collidesX && overlapsX) {
          if (item.type === 'logo') scoreChange += 1;
          else livesLost += 1;
          // item is consumed, don't keep it
        } else if (newY < areaHeight) {
          surviving.push(newItem);
        }
        // items past bottom of area are dropped silently (missed)
      });

      setItems(surviving);
      if (scoreChange) setScore((s) => s + scoreChange);
      if (livesLost) {
        setLives((l) => {
          const newLives = l - livesLost;
          if (newLives <= 0) setGameOver(true);
          return Math.max(0, newLives);
        });
      }
    }, 16);

    return () => clearInterval(loop);
  }, [started, gameOver]);

  // ===== HELPERS =====
  const restart = () => {
    setScore(0);
    setLives(STARTING_LIVES);
    setItems([]);
    setGameOver(false);
    setStarted(true);
  };

  // Localized labels
  const labels = lang === 'ar' ? {
    title: 'لعبة الالتقاط',
    instruction: 'اجمع الشعار، تجنّب الأسد',
    start: 'ابدأ',
    score: 'النتيجة',
    lives: 'المحاولات',
    gameOver: 'انتهت اللعبة',
    finalScore: 'النتيجة النهائية',
    playAgain: 'العب مرة أخرى',
    controls: 'الأسهم، الفأرة، أو اللمس',
  } : {
    title: 'Catch Game',
    instruction: 'Catch the logo, avoid the lion',
    start: 'Start',
    score: 'Score',
    lives: 'Lives',
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
        <span>{labels.lives}: <strong>{'❤'.repeat(lives) || '—'}</strong></span>
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
        onClick={(e) => handlePointerClick(e.clientX)}
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

        {/* Falling items */}
        {items.map((item) => (
          <img
            key={item.id}
            src={item.type === 'lion' ? '/images/psu_logo.png' : '/images/logowhite.png'}
            alt=""
            className={`catch-game__item catch-game__item--${item.type}`}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: `${ITEM_SIZE}px`,
              height: `${ITEM_SIZE}px`,
            }}
          />
        ))}

        {/* Player (driller) */}
        <img
          src="/images/driller.png"
          alt="driller"
          className="catch-game__player"
          style={{
            left: `${playerX}px`,
            width: `${PLAYER_WIDTH}px`,
            height: `${PLAYER_HEIGHT}px`,
          }}
        />
      </div>
    </div>
  );
}

export default CatchGame;
