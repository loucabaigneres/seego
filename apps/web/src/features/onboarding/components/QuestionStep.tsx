import type { QuizQuestion } from '../lib/quiz';
import { QUESTIONS } from '../questions';
import { OptionTile } from '@/components/OptionTile';

interface QuestionStepProps {
  question: QuizQuestion;
  selected: readonly string[];
  onToggle: (option: string) => void;
}

export function QuestionStep({ question, selected, onToggle }: QuestionStepProps) {
  const copy = QUESTIONS[question];

  return (
    <div>
      <h1 className="text-2xl font-display font-normal text-ink">{copy.title}</h1>
      <p className="mt-1 text-sm text-ink-muted mb-5">{copy.subtitle}</p>
      <div className="space-y-3">
        {copy.options.map((option) => (
          <OptionTile
            key={option.value}
            title={option.title}
            description={option.description}
            selected={selected.includes(option.value)}
            onToggle={() => onToggle(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
