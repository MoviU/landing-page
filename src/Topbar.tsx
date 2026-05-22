export type Palette = string[];

type TopbarProps = {
  palettes: Palette[];
  palette: Palette;
  onPaletteChange: (palette: Palette) => void;
  auto: boolean;
  onToggleAuto: () => void;
};

function PaletteSwatch({
  colors,
  active,
  onClick,
}: {
  colors: Palette;
  active: boolean;
  onClick: () => void;
}) {
  const [a, b, c, d] = colors;
  return (
    <button
      type="button"
      className={`palette-swatch${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-label={`Set palette ${colors.join(' ')}`}
      style={{ background: `linear-gradient(120deg, ${a} 0%, ${b} 33%, ${c} 66%, ${d} 100%)` }}
    />
  );
}

function AutoSwatch({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`palette-swatch palette-swatch--auto${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-label="Auto-cycle palettes"
      aria-pressed={active}
      title="Auto-cycle palettes"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2.5l2.2 6.3 6.3 2.2-6.3 2.2-2.2 6.3-2.2-6.3-6.3-2.2 6.3-2.2L12 2.5z"
          fill="currentColor"
        />
        <path
          d="M19 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
    </button>
  );
}

function PaletteSwitcher({
  palettes,
  palette,
  onPaletteChange,
  auto,
  onToggleAuto,
}: TopbarProps) {
  const isActive = (opt: Palette) => opt.every((color, i) => color === palette[i]);
  return (
    <span className="palette-switch" role="radiogroup" aria-label="Background palette">
      <span className="palette-switch-label">Palette</span>
      <span className="palette-swatches">
        <AutoSwatch active={auto} onClick={onToggleAuto} />
        {palettes.map((opt, i) => (
          <PaletteSwatch
            key={i}
            colors={opt}
            active={!auto && isActive(opt)}
            onClick={() => onPaletteChange(opt)}
          />
        ))}
      </span>
    </span>
  );
}

function Topbar(props: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">M.K — 2026</div>
      <PaletteSwitcher {...props} />
      <div className="topbar-right">
        <span className="dot-status">
          <span className="dot" aria-hidden="true" />
          Open to opportunities
        </span>
      </div>
    </header>
  );
}

export default Topbar;
