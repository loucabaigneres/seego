import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789°/#*';

/** Small "+" mark used to frame blocks, like a print crop mark. */
export function Cross({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`pointer-events-none absolute h-3 w-3 ${className}`}
      aria-hidden="true"
    >
      <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Mono section label, e.g. "(01) Manifeste". */
export function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.25em] text-muted">
      ({index}) <span className="ml-2">{children}</span>
    </p>
  );
}

type LineRevealProps = {
  lines: string[];
  className?: string;
  /** 'view' plays when scrolled into view, 'mount' as soon as it renders. */
  trigger?: 'view' | 'mount';
  delay?: number;
};

/** Big headline whose lines slide up from behind a mask, one after the other. */
export function LineReveal({
  lines,
  className = '',
  trigger = 'view',
  delay = 0,
}: LineRevealProps) {
  const play = trigger === 'view' ? { whileInView: { y: '0%' } } : { animate: { y: '0%' } };

  return (
    <span className={`block ${className}`}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.1em]">
          <motion.span
            className="block"
            initial={{ y: '110%' }}
            {...play}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1, ease: EASE_OUT, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Text that scrambles through random glyphs before settling, each time it changes. */
export function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const resolved = Math.floor(((now - start) / 450) * text.length);
      setShown(
        [...text]
          .map((char, i) =>
            i < resolved || char === ' ' ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          )
          .join(''),
      );
      if (resolved < text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, reduced]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="whitespace-pre">
        {reduced ? text : shown}
      </span>
    </span>
  );
}
