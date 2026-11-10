import { createFileRoute } from '@tanstack/react-router';
import { AnalyzingView } from '@/features/onboarding/components/AnalyzingView';
import { QuestionStep } from '@/features/onboarding/components/QuestionStep';
import { QuizFooter } from '@/features/onboarding/components/QuizFooter';
import { QuizHeader } from '@/features/onboarding/components/QuizHeader';
import { useOnboardingQuiz } from '@/features/onboarding/hooks/useOnboardingQuiz';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/onboarding')({
  head: () =>
    seo({
      title: 'Dis-nous ce qui te fait voyager',
      description:
        'Quatre questions sur tes décors, tes envies, tes compagnons de route et ton climat préféré pour personnaliser tes suggestions.',
      path: '/onboarding',
    }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const quiz = useOnboardingQuiz();

  if (quiz.isAnalyzing) {
    return <AnalyzingView />;
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-background px-4 py-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl rounded-card bg-surface p-6 sm:p-8 border border-brand/15">
        <QuizHeader current={quiz.step.current} total={quiz.step.total} progress={quiz.step.progress} />

        {quiz.errorMessage && (
          <div className="mb-4 rounded-xl bg-surface p-3 text-xs font-semibold text-brand border border-brand/20">
            {quiz.errorMessage}
          </div>
        )}

        <QuestionStep question={quiz.question} selected={quiz.selected} onToggle={quiz.toggle} />

        <QuizFooter
          canGoBack={quiz.canGoBack}
          canContinue={quiz.canContinue}
          isLastStep={quiz.isLastStep}
          onBack={quiz.goBack}
          onForward={quiz.goForward}
        />
      </div>
    </div>
  );
}
