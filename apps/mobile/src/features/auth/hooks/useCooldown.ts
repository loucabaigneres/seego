import { useEffect, useState } from 'react';

/** Seconds left before an action (resending a code or a link) can be repeated. */
export function useCooldown(delaySeconds: number) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return { seconds, start: () => setSeconds(delaySeconds) };
}
