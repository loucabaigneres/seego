interface OptionTileProps {
  title: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
}

export function OptionTile({ title, description, selected, onToggle }: OptionTileProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full p-4 rounded-2xl border text-left transition cursor-pointer ${
        selected
          ? 'bg-red-50/50 border-[#FF4D4D] ring-1 ring-[#FF4D4D]'
          : 'bg-[#faf8f6] border-[#eee] hover:border-[#ddd]'
      }`}
    >
      <div className="text-sm font-bold text-[#1a1a1a]">{title}</div>
      <div className="mt-0.5 text-xs text-[#888]">{description}</div>
    </button>
  );
}
