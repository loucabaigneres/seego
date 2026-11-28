import { useGuestId } from '@/hooks/useGuestId';
import { track } from '@/lib/analytics';
import { trpc } from '@/lib/trpc';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useReducer, useState } from 'react';
import {
  canContinue,
  currentQuestion,
  initialQuizState,
  isLastStep,
  QUIZ_QUESTIONS,
  quizProgress,
  quizReducer,
} from '../lib/quiz';

/** Time the progress bar takes to fill up to 100 % before the "analysing" screen shows. */
const COMPLETION_ANIMATION_MS = 600;

/** Time the "analysing" screen stays up before opening the swipe deck. */
const ANALYSIS_DELAY_MS = 1800;

/** "Guide-moi": the 4-question quiz, then the trip it creates opens in the swipe deck. */
export function useOnboardingQuiz() {
  const navigate = useNavigate();
  const guestId = useGuestId();
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submission = useMutation(
    trpc.onboarding.submit.mutationOptions({
      onSuccess: (data) => {
        track('onboarding_completed');
        setTimeout(() => {
          navigate({
            to: '/discovery',
            search: { tripId: data.tripId },
          });
        }, ANALYSIS_DELAY_MS);
      },
      onError: (err) => {
        track('onboarding_failed', { message: err.message });
        setIsFinishing(false);
        setIsAnalyzing(false);
        setErrorMessage(err.message || 'Une erreur est survenue lors du calcul.');
      },
    }),
  );

  // Let the bar reach 100 % before swapping to the analysing screen (cancelled on error).
  useEffect(() => {
    if (!isFinishing) return;
    const timer = setTimeout(() => setIsAnalyzing(true), COMPLETION_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [isFinishing]);

  const goForward = () => {
    track('onboarding_step_completed', {
      step: state.stepIndex + 1,
      total_steps: QUIZ_QUESTIONS.length,
      question: String(currentQuestion(state)),
    });
    if (!isLastStep(state)) {
      dispatch({ type: 'next' });
      return;
    }
    setErrorMessage(null);
    setIsFinishing(true);
    submission.mutate({ ...state.answers, guestId });
  };

  const question = currentQuestion(state);

  return {
    question,
    selected: state.answers[question] as string[],
    toggle: (option: string) => dispatch({ type: 'toggle', question, option }),
    step: {
      current: state.stepIndex + 1,
      total: QUIZ_QUESTIONS.length,
      progress: isFinishing ? 1 : quizProgress(state),
    },
    canGoBack: state.stepIndex > 0,
    canContinue: canContinue(state) && !isFinishing,
    isLastStep: isLastStep(state),
    goBack: () => dispatch({ type: 'back' }),
    goForward,
    isAnalyzing,
    errorMessage,
  };
}
