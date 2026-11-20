interface OptionTileProps {
  title: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  /** `radio` for single-choice groups (wrap them in `role="radiogroup"`), toggle otherwise. */
  role?: 'radio';
}

/** Selectable choice: crema with an outline at rest (it sits on travertino cards), vino with pesca text when selected. */
export function OptionTile({ title, description, selected, onToggle, role }: OptionTileProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={role ? selected : undefined}
      aria-pressed={role ? undefined : selected}
      onClick={onToggle}
      className={`w-full p-4 rounded-2xl border text-left transition cursor-pointer ${
        selected
          ? 'bg-brand border-brand'
          : 'bg-background border-line-strong hover:border-brand'
      }`}
    >
      <div className={`text-sm font-bold ${selected ? 'text-accent' : 'text-ink'}`}>{title}</div>
      <div className={`mt-0.5 text-xs ${selected ? 'text-ink-inverse' : 'text-ink-muted'}`}>
        {description}
      </div>
    </button>
  );
}
