import type { QuizQuestion } from '../lib/quiz';
import { QUESTIONS } from '../questions';
import { OptionTile } from './OptionTile';

interface QuestionStepProps {
  question: QuizQuestion;
  selected: readonly string[];
  onToggle: (option: string) => void;
}

export function QuestionStep({ question, selected, onToggle }: QuestionStepProps) {
  const copy = QUESTIONS[question];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a1a1a]">{copy.title}</h1>
      <p className="mt-1 text-sm text-[#888] mb-5">{copy.subtitle}</p>
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
