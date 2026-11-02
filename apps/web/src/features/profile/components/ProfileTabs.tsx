import type { ProfileTab } from '../types';

const TABS: { id: ProfileTab; label: string }[] = [
  { id: 'trips', label: 'Mes voyages' },
  { id: 'imports', label: 'Inspirations' },
  { id: 'settings', label: 'Paramètres' },
];

export function ProfileTabs({ active, onChange }: { active: ProfileTab; onChange: (tab: ProfileTab) => void }) {
  return (
    <div className="mt-8 flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-95 cursor-pointer ${
            active === tab.id
              ? 'bg-[#FF4D4D] text-white shadow-lg shadow-red-500/20'
              : 'bg-white text-[#555] border border-[#ddd] hover:bg-[#faf8f6]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
