import { useEffect } from 'react';

/** Prevents the page behind a modal from scrolling while it is mounted. */
export function useLockBodyScroll() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
}
