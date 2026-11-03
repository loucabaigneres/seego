import { useParallax, usePrefersReducedMotion } from '../lib/motion';

const FLIGHT_PATH = 'M-60 560 C 250 380, 420 660, 660 430 S 1000 120, 1280 150';

// Plane silhouette pointing to +x, centred on the origin.
const PLANE =
  'M14 0C14-1.6 12.4-2 11-2H4L-4-12H-7.5L-2.5-2H-9L-12-6H-14.5L-12.5 0L-14.5 6H-12L-9 2H-2.5L-7.5 12H-4L4 2H11C12.4 2 14 1.6 14 0Z';

function Cloud({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 50" className={className} aria-hidden="true">
      <g fill="currentColor">
        <circle cx="32" cy="30" r="14" />
        <circle cx="54" cy="22" r="20" />
        <circle cx="78" cy="30" r="15" />
        <rect x="18" y="28" width="76" height="18" rx="9" />
      </g>
    </svg>
  );
}

/** Decorative sky behind the hero: drifting clouds with parallax and a plane on a dashed route. */
export function HeroSky() {
  const reduced = usePrefersReducedMotion();
  const far = useParallax<HTMLDivElement>(0.12);
  const near = useParallax<HTMLDivElement>(-0.18);
  const route = useParallax<HTMLDivElement>(0.22);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Far clouds */}
      <div ref={far} className="absolute inset-0 will-change-transform">
        <div className="animate-drift-slow absolute left-[6%] top-[12%] w-32 text-white/80 sm:w-44">
          <Cloud />
        </div>
        <div className="animate-drift absolute right-[30%] top-[4%] hidden w-28 text-white/70 lg:block">
          <Cloud />
        </div>
      </div>

      {/* Flight route */}
      <div ref={route} className="absolute inset-0 will-change-transform">
        <svg
          className="h-full w-full"
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            d={FLIGHT_PATH}
            stroke="var(--color-ink)"
            strokeOpacity="0.14"
            strokeWidth="2"
            strokeDasharray="6 14"
            strokeLinecap="round"
            className="animate-dash-flow"
          />
          {!reduced && (
            <g>
              <path d={PLANE} fill="var(--color-accent)" transform="scale(1.4)" />
              <animateMotion dur="18s" repeatCount="indefinite" rotate="auto" path={FLIGHT_PATH} />
            </g>
          )}
        </svg>
      </div>

      {/* Near clouds */}
      <div ref={near} className="absolute inset-0 will-change-transform">
        <div className="animate-drift absolute -right-6 top-[58%] w-40 text-white sm:w-56">
          <Cloud />
        </div>
        <div className="animate-drift-slow absolute bottom-[6%] left-[38%] hidden w-36 text-white/90 lg:block">
          <Cloud />
        </div>
      </div>
    </div>
  );
}
