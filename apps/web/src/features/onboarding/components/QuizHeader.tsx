import { ProgressBar } from '@/components/ProgressBar';

interface QuizHeaderProps {
  current: number;
  total: number;
  /** Share of the quiz reached, between 0 and 1. */
  progress: number;
}

export function QuizHeader({ current, total, progress }: QuizHeaderProps) {
  const percent = Math.round(progress * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
        <span>
          Étape {current} sur {total}
        </span>
        <span>{percent} %</span>
      </div>
      <ProgressBar value={progress} />
    </div>
  );
}
