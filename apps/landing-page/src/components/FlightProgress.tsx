import { useEffect, useRef } from 'react';
import { MapPin, Plane } from 'lucide-react';
import { clamp, onScrollFrame } from '../lib/motion';

/** Reading progress shown as a flight path along the bottom of the header. */
export function FlightProgress() {
  const fillRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onScrollFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp(window.scrollY / max) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      if (planeRef.current) {
        planeRef.current.style.left = `${p * 100}%`;
        planeRef.current.style.opacity = p > 0.005 ? '1' : '0';
      }
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5" aria-hidden="true">
      {/* Dashed route */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,var(--color-line)_0_6px,transparent_6px_12px)]" />
      {/* Travelled part */}
      <div
        ref={fillRef}
        className="absolute inset-0 origin-left scale-x-0 bg-accent will-change-transform"
      />
      {/* Plane, stops just before the destination pin */}
      <div className="absolute inset-y-0 left-3 right-10 sm:right-12">
        <div
          ref={planeRef}
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-md shadow-accent/30">
            <Plane className="h-3.5 w-3.5 rotate-45 fill-current" />
          </span>
        </div>
      </div>
      {/* Destination */}
      <MapPin className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-accent sm:right-4" />
    </div>
  );
}
