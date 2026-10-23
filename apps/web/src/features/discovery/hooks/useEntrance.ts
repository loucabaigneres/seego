import { useEffect, useState } from 'react';

/** `false` on the first frame then `true`, to run CSS entrance transitions. */
export function useEntrance() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return shown;
}
