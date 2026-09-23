import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import { Link } from '../router';
import {
  createGame,
  setStatus,
  step,
  tickMs,
  turn,
  type Direction,
  type GameState,
  type Status,
} from './snakeEngine';
import { drawSnake, readSnakeColors } from './snakeRenderer';
import './games.css';

const BEST_KEY = 'snake:best';
const SWIPE_MIN_PX = 24;
// A backgrounded tab pauses requestAnimationFrame; clamp the returning frame so
// the game doesn't resume with a burst of catch-up ticks.
const MAX_FRAME_MS = 250;
const IDLE_REDRAW_MS = 66;

function readBest(): number {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const value = raw === null ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0; // storage blocked (private mode) — just don't keep a best
  }
}

function writeBest(score: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    /* nothing to do — the run still counts on screen */
  }
}

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
};

const PRIMARY_LABEL: Record<Status, string> = {
  ready: 'Start',
  running: 'Pause',
  paused: 'Resume',
  over: 'Play again',
  won: 'Play again',
};

function Overlay({
  status,
  score,
  best,
  onAction,
}: {
  status: Status;
  score: number;
  best: number;
  onAction: () => void;
}) {
  if (status === 'running') return null;

  const copy = {
    ready: { title: 'Snake', line: 'Arrow keys, WASD, or swipe to start.' },
    paused: { title: 'Paused', line: 'Pick up where you left off.' },
    over: {
      title: 'Game over',
      line:
        score >= best && score > 0
          ? `New best — ${score} ${score === 1 ? 'apple' : 'apples'}.`
          : `You ate ${score} ${score === 1 ? 'apple' : 'apples'}.`,
    },
    won: { title: 'Board cleared', line: 'There is nowhere left to grow.' },
  }[status];

  return (
    <div className="snake-overlay">
      <div className="snake-overlay-card">
        <h2>{copy.title}</h2>
        <p>{copy.line}</p>
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {PRIMARY_LABEL[status]}
        </button>
      </div>
    </div>
  );
}

function DPad({ onSteer }: { onSteer: (dir: Direction) => void }) {
  const key = (dir: Direction, label: string, glyph: string) => (
    <button
      type="button"
      className={`dpad-key dpad-${dir}`}
      aria-label={label}
      // Steering on pointerdown keeps the pad feeling immediate, and stops the
      // browser from also firing a synthesized click / focus ring.
      onPointerDown={(event) => {
        event.preventDefault();
        onSteer(dir);
      }}
    >
      {glyph}
    </button>
  );

  return (
    <div className="dpad" role="group" aria-label="Steer the snake">
      {key('up', 'Up', '↑')}
      {key('left', 'Left', '←')}
      {key('right', 'Right', '→')}
      {key('down', 'Down', '↓')}
    </div>
  );
}

function Snake() {
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const [initialGame] = useState(createGame);
  const gameRef = useRef<GameState>(initialGame);
  const prevRef = useRef<GameState>(initialGame);
  const sizeRef = useRef(0); // board edge in CSS px
  const swipeRef = useRef<{ x: number; y: number } | null>(null);

  // Only the score and status drive the UI; everything else lives in refs so
  // the animation loop never re-renders React.
  const [hud, setHud] = useState({ score: 0, status: initialGame.status });
  const hudRef = useRef(hud);
  const [best, setBest] = useState(readBest);

  const sync = useCallback(() => {
    const game = gameRef.current;
    if (
      game.score === hudRef.current.score &&
      game.status === hudRef.current.status
    ) {
      return;
    }
    hudRef.current = { score: game.score, status: game.status };
    setHud(hudRef.current);
  }, []);

  // Keep the backing store in step with the element's CSS size and the display
  // density, capped at 2x — past that it's pixels nobody can see.
  useEffect(() => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    if (!board || !canvas) return;

    const resize = () => {
      const size = Math.floor(board.getBoundingClientRect().width);
      if (size <= 0 || size === sizeRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = size;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  // The clock. A fixed-timestep accumulator advances the game while every
  // frame draws it, so movement stays smooth and speed stays frame-rate
  // independent.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let accumulated = 0;
    let sinceDraw = Infinity;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      const delta = Math.min(now - last, MAX_FRAME_MS);
      last = now;

      if (gameRef.current.status === 'running') {
        accumulated += delta;
        let interval = tickMs(gameRef.current.score);
        while (accumulated >= interval) {
          accumulated -= interval;
          prevRef.current = gameRef.current;
          gameRef.current = step(gameRef.current);
          if (gameRef.current.status !== 'running') {
            // Rest on the final position instead of tweening into the wall.
            prevRef.current = gameRef.current;
            accumulated = 0;
            break;
          }
          interval = tickMs(gameRef.current.score);
        }
      } else {
        accumulated = 0;
      }

      const game = gameRef.current;
      const idle = game.status !== 'running';
      sinceDraw += delta;

      // While idle the board is static apart from the palette cross-fade, so a
      // few redraws a second is plenty.
      if (sizeRef.current > 0 && (!idle || sinceDraw >= IDLE_REDRAW_MS)) {
        sinceDraw = 0;
        const alpha =
          reducedMotion || idle
            ? 1
            : Math.min(1, accumulated / tickMs(game.score));
        const pulse = reducedMotion ? 1 : 1 + Math.sin(now / 260) * 0.06;
        drawSnake(
          ctx,
          sizeRef.current,
          game,
          prevRef.current,
          alpha,
          readSnakeColors(),
          pulse
        );
      }

      sync();
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, sync]);

  const steer = useCallback(
    (dir: Direction) => {
      gameRef.current = turn(gameRef.current, dir);
      sync();
    },
    [sync]
  );

  const restart = useCallback(() => {
    const fresh = createGame();
    gameRef.current = fresh;
    prevRef.current = fresh;
    sync();
  }, [sync]);

  const primaryAction = useCallback(() => {
    const game = gameRef.current;
    if (game.status === 'over' || game.status === 'won') {
      restart();
      return;
    }
    gameRef.current = setStatus(
      game,
      game.status === 'running' ? 'paused' : 'running'
    );
    sync();
  }, [restart, sync]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const dir =
        KEY_DIRECTIONS[event.key] ?? KEY_DIRECTIONS[event.key.toLowerCase()];
      if (dir) {
        event.preventDefault(); // arrows would otherwise scroll the page
        steer(dir);
        return;
      }

      const target = document.activeElement;
      const onControl =
        target instanceof HTMLElement &&
        (target.tagName === 'BUTTON' || target.tagName === 'A');

      if (event.key === ' ' || event.key === 'Enter') {
        if (onControl) return; // let the focused control handle its own key
        event.preventDefault();
        primaryAction();
      } else if (event.key.toLowerCase() === 'r') {
        restart();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [primaryAction, restart, steer]);

  // Losing because you tabbed away isn't losing.
  useEffect(() => {
    const pause = () => {
      if (gameRef.current.status !== 'running') return;
      gameRef.current = setStatus(gameRef.current, 'paused');
      sync();
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };

    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sync]);

  useEffect(() => {
    if (hud.status !== 'over' && hud.status !== 'won') return;
    if (hud.score <= best) return;
    setBest(hud.score);
    writeBest(hud.score);
  }, [hud, best]);

  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    swipeRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    if (!start) return;
    const touch = event.touches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX && Math.abs(dy) < SWIPE_MIN_PX) return;

    steer(
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? 'right'
          : 'left'
        : dy > 0
          ? 'down'
          : 'up'
    );
    swipeRef.current = null; // one turn per swipe
  };

  const endTouch = () => {
    swipeRef.current = null;
  };

  return (
    <section className="arcade-page arcade-page--game">
      <header className="arcade-head">
        <Link className="arcade-back" href="/games">
          ← Arcade
        </Link>
        <h1 className="arcade-title">Snake</h1>
        <p className="arcade-sub">
          Eat the apples, grow longer, and stay off your own tail.
        </p>
      </header>

      <div className="snake-layout">
        <div className="snake-stage">
          <div
            className="snake-board"
            ref={boardRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={endTouch}
            onTouchCancel={endTouch}
          >
            <canvas className="snake-canvas" ref={canvasRef} />
            <Overlay
              status={hud.status}
              score={hud.score}
              best={best}
              onAction={primaryAction}
            />
          </div>
          <DPad onSteer={steer} />
        </div>

        <aside className="snake-panel">
          <div className="snake-scores" aria-live="polite">
            <div className="snake-stat">
              <span className="label">Score</span>
              <strong>{hud.score}</strong>
            </div>
            <div className="snake-stat">
              <span className="label">Best</span>
              <strong>{best}</strong>
            </div>
          </div>

          <div className="snake-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={primaryAction}
            >
              {PRIMARY_LABEL[hud.status]}
            </button>
            <button type="button" className="btn btn-ghost" onClick={restart}>
              Restart
            </button>
          </div>

          <div className="snake-help">
            <span className="label">Controls</span>
            <ul>
              <li>
                <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or{' '}
                <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> to steer
              </li>
              <li>
                <kbd>Space</kbd> to pause or resume
              </li>
              <li>
                <kbd>R</kbd> to start over
              </li>
              <li>On a phone, swipe the board or use the pad</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Snake;
