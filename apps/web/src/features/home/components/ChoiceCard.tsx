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
      className={`group relative flex flex-col justify-between rounded-card bg-surface p-6 sm:p-7 border border-brand/15 transition ${
        loading
          ? 'opacity-60 cursor-wait'
          : `${featured ? 'hover:border-brand' : 'hover:border-line-strong'} hover:shadow-md cursor-pointer`
      }`}
    >
      {badge && (
        <div className="absolute right-5 top-5 rounded-full bg-accent px-2.5 py-1 text-[0.65rem] font-bold text-brand">
          {badge}
        </div>
      )}

      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-card border border-brand/15 bg-surface text-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h2 className="mt-5 text-xl font-display font-normal text-ink">{title}</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{description}</p>
      </div>

      <div
        className={`mt-6 flex items-center gap-2 text-xs font-bold ${
          featured ? 'text-brand' : 'text-ink'
        }`}
      >
        {loading ? (
          <div className="flex items-center gap-2 text-ink-muted">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
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
