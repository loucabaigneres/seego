import { useEffect, useState } from 'react';
import { Plane } from 'lucide-react';

type ScrollToTopProps = {
  /** Custom scroll (e.g. through a smooth-scroll library); defaults to a native smooth scroll. */
  onScrollTop?: () => void;
};

export function ScrollToTop({ onScrollTop }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!launching) return;
    const timer = setTimeout(() => setLaunching(false), 900);
    return () => clearTimeout(timer);
  }, [launching]);

  return (
    <button
      type="button"
      aria-label="Remonter en haut de la page"
      onClick={() => {
        setLaunching(true);
        if (onScrollTop) onScrollTop();
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={`group fixed bottom-6 right-6 z-50 flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-ink text-white shadow-lg shadow-black/20 transition-all duration-300 hover:brightness-110 active:scale-90 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      {/* Plane points up, nudges on hover and takes off on click */}
      <Plane
        key={String(launching)}
        className={`h-5 w-5 -rotate-45 fill-current transition-transform group-hover:-translate-y-0.5 ${
          launching ? 'animate-takeoff' : ''
        }`}
      />
    </button>
  );
}
