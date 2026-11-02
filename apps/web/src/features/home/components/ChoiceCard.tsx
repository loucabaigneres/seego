interface ChoiceCardProps {
  icon: string;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  /** Highlighted option: coral badge, hover and call to action. */
  featured?: boolean;
  badge?: string;
  loading?: boolean;
  loadingLabel?: string;
}

/** One of the two ways to start a trip on the home page. */
export function ChoiceCard({
  icon,
  title,
  description,
  cta,
  onClick,
  featured = false,
  badge,
  loading = false,
  loadingLabel,
}: ChoiceCardProps) {
  return (
    <div
      onClick={!loading ? onClick : undefined}
      className={`group relative flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-7 shadow-sm border border-[#eee] transition ${
        loading
          ? 'opacity-60 cursor-wait'
          : `${featured ? 'hover:border-[#FF4D4D]' : 'hover:border-[#ddd]'} hover:shadow-md cursor-pointer`
      }`}
    >
      {badge && (
        <div className="absolute right-5 top-5 rounded-full bg-red-50 px-2.5 py-1 text-[0.65rem] font-bold text-[#FF4D4D]">
          {badge}
        </div>
      )}

      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf8f6] text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h2 className="mt-5 text-xl font-bold text-[#1a1a1a]">{title}</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-[#888]">{description}</p>
      </div>

      <div
        className={`mt-6 flex items-center gap-2 text-xs font-bold ${
          featured ? 'text-[#FF4D4D]' : 'text-[#1a1a1a]'
        }`}
      >
        {loading ? (
          <div className="flex items-center gap-2 text-[#888]">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#FF4D4D]/20 border-t-[#FF4D4D]" />
            <span>{loadingLabel}</span>
          </div>
        ) : (
          <>
            <span>{cta}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </>
        )}
      </div>
    </div>
  );
}
