import type { ReactNode } from 'react';
import { motion } from 'motion/react';

type RevealProps = {
  children: ReactNode;
  as?: 'div' | 'article';
  className?: string;
  /** Delay in ms, handy for staggering siblings. */
  delay?: number;
  /** Entrance direction. */
  from?: 'up' | 'left' | 'right' | 'scale';
};

const OFFSETS = {
  up: { y: 28 },
  left: { x: -36 },
  right: { x: 36 },
  scale: { scale: 0.94 },
};

/** Fades its content in the first time it scrolls into view. */
export function Reveal({ children, as = 'div', className, delay = 0, from = 'up' }: RevealProps) {
  const Tag = as === 'article' ? motion.article : motion.div;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...OFFSETS[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
