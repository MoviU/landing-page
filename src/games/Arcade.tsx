import { Link } from '../router';
import './games.css';

// A small board of rounded cells with a snake curling toward an apple — the
// same shapes the real game draws on canvas, at rest.
function SnakeArt() {
  const cells = [
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 3, y: 2 },
    { x: 3, y: 1 },
    { x: 4, y: 1 },
  ];

  return (
    <svg
      className="game-art"
      viewBox="0 0 6 5"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {cells.map(({ x, y }, i) => (
        <rect
          key={`${x}-${y}`}
          x={x + 0.08}
          y={y + 0.08}
          width="0.84"
          height="0.84"
          rx="0.26"
          fill={i === cells.length - 1 ? 'var(--g2)' : 'var(--g1)'}
          opacity={0.45 + (i / cells.length) * 0.55}
        />
      ))}
      <circle cx="1.5" cy="1.5" r="0.3" fill="#e5484d" />
    </svg>
  );
}

type GameCard = {
  slug: string;
  name: string;
  blurb: string;
  tag: string;
};

const GAMES: GameCard[] = [
  {
    slug: 'snake',
    name: 'Snake',
    blurb:
      'The classic. Eat apples, grow longer, and try not to run into the walls or yourself.',
    tag: 'Arcade',
  },
];

function Arcade() {
  return (
    <section className="arcade-page">
      <header className="arcade-head">
        <Link className="arcade-back" href="/">
          &larr; Home
        </Link>
        <h1 className="arcade-title">Arcade</h1>
        <p className="arcade-sub">
          Small games, built for the fun of building them. Keyboard or touch, no
          accounts, no scores to upload anywhere.
        </p>
      </header>

      <div className="game-grid">
        {GAMES.map((game) => (
          <Link
            key={game.slug}
            className="game-card"
            href={`/games/${game.slug}`}
          >
            <SnakeArt />
            <div className="game-card-body">
              <span className="label">{game.tag}</span>
              <h2>{game.name}</h2>
              <p>{game.blurb}</p>
              <span className="game-card-cta">Play &rarr;</span>
            </div>
          </Link>
        ))}

        <article className="game-card game-card--soon" aria-hidden="true">
          <div className="game-card-body">
            <span className="label">Next up</span>
            <h2>More soon</h2>
            <p>Another one lands here whenever an evening frees up.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default Arcade;
