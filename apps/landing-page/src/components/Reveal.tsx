import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from '../lib/motion';

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Delay in ms, handy for staggering siblings. */
  delay?: number;
  /** Entrance direction. */
  from?: 'up' | 'left' | 'right' | 'scale';
};

export function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  from = 'up',
}: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>();

  return (
    <Tag
      ref={ref}
      data-from={from}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
