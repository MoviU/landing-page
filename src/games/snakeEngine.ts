// Snake, as a pure state machine. No DOM, no timers — the component owns the
// clock and the canvas and just calls step()/turn() on this.

export const COLS = 20;
export const ROWS = 20;

const START_LENGTH = 4;

export type Point = { x: number; y: number };

export type Direction = 'up' | 'right' | 'down' | 'left';

export type Status = 'ready' | 'running' | 'paused' | 'over' | 'won';

export type GameState = {
  snake: Point[]; // head first
  dir: Direction; // direction the head moved on the last tick
  queue: Direction[]; // buffered input, so a fast double-turn isn't swallowed
  apple: Point;
  score: number;
  status: Status;
};

export const DIRECTION_VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

// At most two turns are buffered: enough to chain a corner at speed, few
// enough that mashing keys can't queue up a move you no longer want.
const MAX_QUEUED_TURNS = 2;

const CELLS = COLS * ROWS;

// The snake speeds up as it grows, down to a floor that stays playable.
const BASE_TICK_MS = 150;
const MIN_TICK_MS = 70;

export const tickMs = (score: number) =>
  Math.max(MIN_TICK_MS, BASE_TICK_MS - score * 3);

// Uniformly picks one of the cells the snake doesn't occupy.
export function spawnApple(snake: Point[], random = Math.random): Point {
  const taken = new Set(snake.map((p) => p.y * COLS + p.x));
  const free: Point[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!taken.has(y * COLS + x)) free.push({ x, y });
    }
  }
  // Board full — the caller flips to 'won', so this apple is never drawn.
  if (free.length === 0) return snake[0];
  return free[Math.floor(random() * free.length)];
}

export function createGame(random = Math.random): GameState {
  const y = Math.floor(ROWS / 2);
  const x = Math.floor(COLS / 2);
  const snake = Array.from({ length: START_LENGTH }, (_, i) => ({
    x: x - i,
    y,
  }));

  return {
    snake,
    dir: 'right',
    queue: [],
    apple: spawnApple(snake, random),
    score: 0,
    status: 'ready',
  };
}

// Queue a turn. The first steer of a fresh game also starts it.
export function turn(state: GameState, dir: Direction): GameState {
  if (state.status === 'ready') {
    // Starting back the way the snake faces would be a reversal step() drops,
    // sending it the opposite way to the input. Turn it around instead: the
    // tail becomes the head.
    if (dir === OPPOSITE[state.dir]) {
      return {
        ...state,
        status: 'running',
        snake: [...state.snake].reverse(),
        dir,
        queue: [],
      };
    }
    return { ...state, status: 'running', queue: [dir] };
  }
  if (state.status !== 'running') return state;
  if (state.queue.length >= MAX_QUEUED_TURNS) return state;

  // Ignore a repeat of the direction already queued (or already travelling).
  const last = state.queue[state.queue.length - 1] ?? state.dir;
  if (dir === last || dir === OPPOSITE[last]) return state;

  return { ...state, queue: [...state.queue, dir] };
}

export function setStatus(state: GameState, status: Status): GameState {
  return { ...state, status };
}

// Advance one tick. Returns the same object when there's nothing to advance,
// so callers can cheaply detect a no-op.
export function step(state: GameState, random = Math.random): GameState {
  if (state.status !== 'running') return state;

  const queue = state.queue.slice();
  let dir = state.dir;
  while (queue.length > 0) {
    const next = queue.shift()!;
    // A reversal would drive straight into the neck; drop it and try the next.
    if (next !== dir && next !== OPPOSITE[dir]) {
      dir = next;
      break;
    }
  }

  const vector = DIRECTION_VECTORS[dir];
  const head = {
    x: state.snake[0].x + vector.x,
    y: state.snake[0].y + vector.y,
  };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
  const ate = !hitWall && head.x === state.apple.x && head.y === state.apple.y;

  // The tail cell empties on this same tick unless we're growing, so chasing
  // your own tail is legal.
  const body = ate ? state.snake : state.snake.slice(0, -1);
  const hitSelf =
    !hitWall && body.some((p) => p.x === head.x && p.y === head.y);

  if (hitWall || hitSelf) {
    return { ...state, dir, queue, status: 'over' };
  }

  const snake = [head, ...body];
  if (!ate) return { ...state, snake, dir, queue };

  const filledBoard = snake.length >= CELLS;
  return {
    ...state,
    snake,
    dir,
    queue,
    score: state.score + 1,
    apple: filledBoard ? state.apple : spawnApple(snake, random),
    status: filledBoard ? 'won' : 'running',
  };
}
