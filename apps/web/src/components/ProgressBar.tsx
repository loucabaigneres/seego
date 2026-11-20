interface ProgressBarProps {
  /** Share completed, between 0 and 1. */
  value: number;
}

/** Empty track that fills up, shared by the onboarding quiz and the trip form. */
export function ProgressBar({ value }: ProgressBarProps) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-2 w-full overflow-hidden rounded-full bg-background"
    >
      <div
        className="h-full rounded-full bg-cta transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
