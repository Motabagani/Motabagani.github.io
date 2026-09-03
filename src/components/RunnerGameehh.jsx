// ============================================================
// RUNNER GAME 2.0
// Same gameplay as RunnerGame, but redesigned chrome.
// - No bordered game area; the game uses the full page width
// - Horizon line instead of lavender ground band
// - Clean "GREAT STUFF TAKE TIME" pre-start screen
// - Subtle HUD during play
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

const PLAYER_WIDTH = 130;
const PLAYER_HEIGHT = 95;
const PLAYER_X = 80;
const GROUND_HEIGHT = 2;          // just a thin horizon line
const GAME_HEIGHT = 380;

const GRAVITY = 2000;
const JUMP_VELOCITY = 800;

const BASE_SPEED = 320;
const SPEED_RAMP = 0.04;

const OBSTACLE_SIZE = 70;
const COLLECTIBLE_SIZE = 40;

const OBSTACLE_MIN_GAP = 1200;
const OBSTACLE_MAX_GAP = 2400;
const COLLECTIBLE_MIN_GAP = 1800;
const COLLECTIBLE_MAX_GAP = 4000;

const COLLECTIBLE_MIN_Y = 160;
const COLLECTIBLE_MAX_Y = 240;

function RunnerGame2() {
  const { lang } = useLanguage();

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);

  const gameAreaRef = useRef(null);
  const playerYRef = useRef(0);
  const playerVelocityRef = useRef(0);
  const playerElRef = useRef(null);
  const obstaclesRef = useRef([]);
  const collectiblesRef = useRef([]);
  const speedRef = useRef(BASE_SPEED);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);

  const nextObstacleAtRef = useRef(0);
  const nextCollectibleAtRef = useRef(0);
  const lastFrameRef = useRef(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);

  const [, forceRender] = useState(0);
  const requestRender = () => forceRender((n) => n + 1);

  const jump = () => {
    if (!started || gameOver) return;
    if (playerYRef.current <= 0.1) {
      playerVelocityRef.current = JUMP_VELOCITY;
    }
  };

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

  const handleTap = () => {
    if (gameOver) { restart(); return; }
    if (!started) { restart(); return; }
    jump();
  };

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

      const elapsed = (now - startTimeRef.current) / 1000;
      speedRef.current = BASE_SPEED + elapsed * elapsed * SPEED_RAMP * 30;

      distanceRef.current += speedRef.current * dt;
      const newScore = Math.floor(distanceRef.current / 10);
      if (newScore !== scoreRef.current) {
        scoreRef.current = newScore;
        setScore(newScore);
      }

      // Player physics
      playerVelocityRef.current -= GRAVITY * dt;
      playerYRef.current += playerVelocityRef.current * dt;
      if (playerYRef.current < 0) {
        playerYRef.current = 0;
        playerVelocityRef.current = 0;
      }

      // Smooth player rendering — direct DOM
      if (playerElRef.current) {
        playerElRef.current.style.transform =
          `translate3d(${PLAYER_X}px, ${groundY - PLAYER_HEIGHT - playerYRef.current}px, 0)`;
      }

      // Spawn obstacles
      if (now > nextObstacleAtRef.current) {
        obstaclesRef.current.push({
          id: now + Math.random(),
          x: areaWidth + 20,
        });
        const gap = OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
        const speedFactor = BASE_SPEED / speedRef.current;
        nextObstacleAtRef.current = now + gap * speedFactor;
      }

      // Spawn collectibles
      if (now > nextCollectibleAtRef.current) {
        collectiblesRef.current.push({
          id: now + Math.random(),
          x: areaWidth + 20,
          y: COLLECTIBLE_MIN_Y + Math.random() * (COLLECTIBLE_MAX_Y - COLLECTIBLE_MIN_Y),
        });
        nextCollectibleAtRef.current =
          now + COLLECTIBLE_MIN_GAP + Math.random() * (COLLECTIBLE_MAX_GAP - COLLECTIBLE_MIN_GAP);
      }

      // Collision detection
      const playerLeft = PLAYER_X;
      const playerRight = PLAYER_X + PLAYER_WIDTH;
      const playerBottom = groundY - playerYRef.current;
      const playerTop = playerBottom - PLAYER_HEIGHT;

      let hitLion = false;
      const survivingObstacles = [];
      for (const obs of obstaclesRef.current) {
        obs.x -= speedRef.current * dt;
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
      if (collected) distanceRef.current += collected * 500;

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
    scoreRef.current = 0;
    distanceRef.current = 0;
    speedRef.current = BASE_SPEED;
    nextObstacleAtRef.current = 0;
    nextCollectibleAtRef.current = 0;
    startTimeRef.current = 0;
    setScore(0);
    setGameOver(false);
    setStarted(true);
  };

  const labels = lang === 'ar' ? {
    prestartTitle: 'الأشياء العظيمة تحتاج وقتاً',
    prestartSub: 'بسسس، في هذه الأثناء جرّب الضغط على المسافة',
    score: 'النتيجة',
    highScore: 'الأعلى',
    gameOver: 'انتهت اللعبة',
    finalScore: 'النتيجة النهائية',
    playAgain: 'العب مرة أخرى',
    afterHint: 'تجنّب أسد بنسلفانيا، تماماً كما تجنّبت التقاط صور التخرج هناك',
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

        {/* Obstacles */}
        {obstaclesRef.current.map((obs) => (
          <img
            key={obs.id}
            src="images/shrine.png"
            alt=""
            className="runner2__obstacle"
            style={{
              transform: `translate3d(${obs.x}px, ${groundY - OBSTACLE_SIZE}px, 0)`,
              width: `${OBSTACLE_SIZE}px`,
              height: `${OBSTACLE_SIZE}px`,
            }}
          />
        ))}

        {/* Collectibles */}
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

        {/* Player */}
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

      {/* Post-game: roast text */}
      {started && !gameOver && (
        <p className="runner2__roast">{labels.afterHint}</p>
      )}

      {/* Game over overlay */}
      {gameOver && (
        <div className="runner2__overlay">
          <h4>{labels.gameOver}</h4>
          <p>{labels.finalScore}: <strong>{score}</strong></p>
          <button className="runner2__button" onClick={(e) => { e.stopPropagation(); restart(); }}>
            {labels.playAgain}
          </button>
        </div>
      )}
    </div>
  );
}

export default RunnerGame2;
