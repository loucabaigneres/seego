import { createFileRoute } from '@tanstack/react-router';
import { AnalyzingView } from '@/features/onboarding/components/AnalyzingView';
import { QuestionStep } from '@/features/onboarding/components/QuestionStep';
import { QuizFooter } from '@/features/onboarding/components/QuizFooter';
import { QuizHeader } from '@/features/onboarding/components/QuizHeader';
import { useOnboardingQuiz } from '@/features/onboarding/hooks/useOnboardingQuiz';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  const quiz = useOnboardingQuiz();

  if (quiz.isAnalyzing) {
    return <AnalyzingView />;
  }

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#F2EDE8] px-4 py-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-[#eee]">
        <QuizHeader current={quiz.step.current} total={quiz.step.total} progress={quiz.step.progress} />

        {quiz.errorMessage && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-[#FF4D4D] border border-red-100">
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
