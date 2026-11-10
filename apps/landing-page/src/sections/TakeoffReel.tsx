import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useScroll, useTransform } from 'motion/react';
import { PHOTOS, unsplash } from '../lib/photos';
import { useScrub } from '../lib/useScrub';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const HEADER = 72; // fixed header height (h-[4.5rem])

// Scroll phases: lean towards the window, then fly through it, then hold on the open sky.
const LEAN_END = 0.35;
const THROUGH_END = 0.95;

/**
 * The airplane window for a scroll progress (tall, with wide elliptical corners).
 * First it grows as if you leaned towards it, then it blows up past the screen edges
 * so you end up looking at the sky alone. `through` is 0..1 during that second phase.
 */
function porthole(progress: number, width: number, height: number) {
  const lean = clamp01(progress / LEAN_END);
  const through = clamp01((progress - LEAN_END) / (THROUGH_END - LEAN_END));
  // Centred in the space left under the fixed header.
  const room = height - HEADER;
  const h0 = room * (0.6 + 0.3 * lean);
  const w0 = Math.min(h0 * 0.7, width * (0.62 + 0.24 * lean));
  // Ease-in so the window rushes past at the end; large enough that its rounded corners leave the screen.
  const scale = 1 + through ** 2 * (Math.max(width / w0, height / h0) * 2.6 - 1);
  const w = w0 * scale;
  const h = h0 * scale;
  const top = HEADER + room / 2 - h / 2;
  const left = (width - w) / 2;
  return { top, left, w, h, rx: w * 0.5, ry: h * 0.3, through };
}

type TakeoffReelProps = {
  /** Content that scrolls over the open sky once you are through the window. */
  children?: ReactNode;
};

/**
 * Pinned section: the clouds seen through a plane window; scrolling leans in, flies through it,
 * then `children` scroll up over the sky while it stays pinned behind them.
 */
export function TakeoffReel({ children }: TakeoffReelProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // The window animation only spans the first part of the section (the track); the rest is the overlay.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });

  // Stage size as motion values, so the window geometry follows resizes without re-rendering.
  const stageW = useMotionValue(0);
  const stageH = useMotionValue(0);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      stageW.set(entry.contentRect.width);
      stageH.set(entry.contentRect.height);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stageW, stageH]);

  // Every window measurement derives from scroll progress + stage size.
  type Porthole = ReturnType<typeof porthole>;
  const useWindow = <T,>(pick: (r: Porthole, p: number, w: number, h: number) => T) =>
    useTransform([scrollYProgress, stageW, stageH], (values) => {
      const [p, w, h] = values as number[];
      return pick(porthole(p, w, h), p, w, h);
    });

  // Negative insets put the window edges off-screen while flying through; once past, no clip at all.
  const clipPath = useWindow((r, _p, w, h) =>
    r.through >= 1
      ? 'none'
      : `inset(${r.top}px ${w - r.left - r.w}px ${h - r.top - r.h}px ${r.left}px round ${r.rx}px / ${r.ry}px)`,
  );
  const frameTop = useWindow((r) => r.top);
  const frameLeft = useWindow((r) => r.left);
  const frameWidth = useWindow((r) => r.w);
  const frameHeight = useWindow((r) => r.h);
  const frameRadius = useWindow((r) => `${r.rx}px / ${r.ry}px`);
  const frameOpacity = useWindow((r) => 1 - clamp01((r.through - 0.6) / 0.4));
  // The window shade starts half down and slides up in the first part of the scroll.
  const shadeHeight = useWindow((r, p) => r.h * 0.45 * (1 - clamp01(p / 0.25)));

  const imageScale = useScrub(scrollYProgress, [0, THROUGH_END], [1.35, 1]);
  // The words part to let you through, then leave the sky on its own.
  const leftX = useScrub(scrollYProgress, [0, THROUGH_END], ['0vw', '-60vw']);
  const rightX = useScrub(scrollYProgress, [0, THROUGH_END], ['0vw', '60vw']);
  const wordsOpacity = useScrub(scrollYProgress, [LEAN_END, THROUGH_END - 0.1], [1, 0]);

  return (
    <section id="decollage" data-pinned className="relative">
      {/* Measures the window animation: one screen pinned + 120vh of scroll */}
      <div
        ref={trackRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100svh+120vh)]"
        aria-hidden="true"
      />
      <div
        ref={stageRef}
        className="sticky top-0 flex h-svh items-center justify-center overflow-hidden bg-background"
      >
        {/* View through the window, with the shade inside the same clip */}
        <motion.div style={{ clipPath }} className="absolute inset-0">
          <motion.img
            src={unsplash(PHOTOS.wing, 1800, 0.6)}
            alt="Aile d’avion au-dessus d’une mer de nuages, vue d’un hublot"
            loading="lazy"
            draggable={false}
            style={{ scale: imageScale }}
            className="h-full w-full object-cover"
          />
          <motion.div
            style={{ top: frameTop, left: frameLeft, width: frameWidth, height: shadeHeight }}
            className="absolute flex items-end justify-center bg-gradient-to-b from-background to-surface shadow-[0_6px_14px_rgb(0_0_0/0.18)]"
            aria-hidden="true"
          >
            {/* Pull handle */}
            <span className="mb-2 h-1.5 w-12 rounded-full bg-line-strong" />
          </motion.div>
        </motion.div>

        {/* Plastic window frame: thick rim, thin seam, depth shadow inside */}
        <motion.div
          style={{
            top: frameTop,
            left: frameLeft,
            width: frameWidth,
            height: frameHeight,
            borderRadius: frameRadius,
            opacity: frameOpacity,
          }}
          className="pointer-events-none absolute shadow-[0_0_0_18px_var(--color-background),0_0_0_19px_var(--color-line),0_0_0_34px_var(--color-surface),0_24px_60px_14px_rgb(0_0_0/0.12),inset_0_0_0_6px_rgb(255_255_255/0.35),inset_0_10px_40px_rgb(0_0_0/0.35)]"
          aria-hidden="true"
        />

        {/* Difference blend keeps the words readable on cream and on the photo */}
        <motion.h2
          style={{ opacity: wordsOpacity }}
          className="pointer-events-none relative mt-[4.5rem] flex w-full justify-center gap-[3vw] text-[clamp(2.8rem,10vw,10rem)] font-extrabold leading-none tracking-tight text-ink-inverse mix-blend-difference"
        >
          <motion.span style={{ x: leftX }}>Prêt</motion.span>
          <motion.span style={{ x: rightX }}>à partir ?</motion.span>
        </motion.h2>
      </div>

      {/* Scroll room for the window animation, then the overlay rides up over the pinned sky */}
      <div className="h-[120vh]" aria-hidden="true" />
      {children && <div className="relative z-10 pb-[12vh]">{children}</div>}
    </section>
  );
}
