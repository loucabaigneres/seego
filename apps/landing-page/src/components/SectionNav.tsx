import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

const SECTIONS = [
  { id: 'top', label: 'Accueil' },
  { id: 'departs', label: 'Départs' },
  { id: 'globe', label: 'Globe' },
  { id: 'itineraire', label: 'Itinéraire' },
  { id: 'faq', label: 'FAQ' },
  { id: 'embarquement', label: 'Embarquement' },
];

/** Side navigation drawn as a route: one stop per section, the plane marks where you are. */
export function SectionNav() {
  const [active, setActive] = useState('top');

  useEffect(() => {
    // A section is "current" when it crosses the middle of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections de la page"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <span
        className="absolute bottom-3 left-1/2 top-3 w-px -translate-x-1/2 bg-[repeating-linear-gradient(180deg,var(--color-muted)_0_4px,transparent_4px_8px)] opacity-40"
        aria-hidden="true"
      />
      <ul className="relative flex flex-col items-center gap-5">
        {SECTIONS.map(({ id, label }) => {
          const current = id === active;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-label={label}
                aria-current={current ? 'location' : undefined}
                className="group relative flex h-6 w-6 items-center justify-center"
              >
                {current ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-md shadow-accent/30">
                    <Plane className="h-3 w-3 rotate-135 fill-current" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-muted/60 bg-cream transition group-hover:scale-125 group-hover:border-accent" />
                )}
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[0.7rem] font-bold text-white opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
