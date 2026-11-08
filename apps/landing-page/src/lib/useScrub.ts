import { useMemo } from 'react';
import { transform, useTransform, type MotionValue } from 'motion/react';

/**
 * Same as `useTransform(value, input, output)`, but always computed in JS.
 * The array form lets motion hand the animation to the browser's ScrollTimeline,
 * which maps progress wrongly on these tall pinned sections (values got stuck mid-way).
 */
export function useScrub<T>(value: MotionValue<number>, input: number[], output: T[]) {
  const key = JSON.stringify([input, output]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mapper = useMemo(() => transform(input, output), [key]);
  return useTransform(value, mapper);
}
