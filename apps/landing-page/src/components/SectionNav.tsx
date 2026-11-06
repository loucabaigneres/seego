import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

type Section = { id: string; label: string };

/** Side navigation drawn as a route: one stop per section, the plane marks where you are. */
export function SectionNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0].id);
  const ids = sections.map((s) => s.id).join(',');

  useEffect(() => {
    // The current section is the last one (in page order) whose top has passed the middle of
    // the screen. Reading positions on scroll never skips a section, even a short one crossed
    // in a single frame, and nested blocks (the FAQ inside the take-off section) work too.
    const order = ids.split(',');
    let frame = 0;
    const update = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let current = order[0];
      for (const id of order) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= middle) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);

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
        {sections.map(({ id, label }) => {
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
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cta text-ink shadow-md shadow-cta/30">
                    <Plane className="h-3 w-3 rotate-135 fill-current" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-ink-muted/60 bg-background transition group-hover:scale-125 group-hover:border-cta" />
                )}
                <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[0.7rem] font-bold text-ink-inverse opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
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
