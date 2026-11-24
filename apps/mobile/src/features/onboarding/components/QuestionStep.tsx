import { View } from 'react-native';

import { Reveal, Text } from '@/ui';

import type { QuizQuestion } from '../lib/quiz';
import { QUESTIONS } from '../questions';
import { OptionTile } from './OptionTile';

export interface QuestionStepProps {
  question: QuizQuestion;
  selected: string[];
  onToggle: (option: string) => void;
}

export function QuestionStep({ question, selected, onToggle }: QuestionStepProps) {
  const { title, subtitle, options } = QUESTIONS[question];

  return (
    <View className="gap-8">
      <Reveal order={0} className="gap-2.5">
        <Text variant="title" role="heading">
          {title}
        </Text>
        <Text tone="muted">{subtitle}</Text>
      </Reveal>

      <View role="group" aria-label={title} className="gap-2.5">
        {options.map((option, index) => (
          <Reveal key={option.value} order={index + 1}>
            <OptionTile
              icon={option.icon}
              title={option.title}
              description={option.description}
              selected={selected.includes(option.value)}
              onPress={() => onToggle(option.value)}
            />
          </Reveal>
        ))}
      </View>
    </View>
  );
}
