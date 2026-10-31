import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useReducer, useState } from 'react';
import { useGuestId } from '@/hooks/useGuestId';
import { trpc } from '@/lib/trpc';
import {
  canContinue,
  currentQuestion,
  initialQuizState,
  isLastStep,
  QUIZ_QUESTIONS,
  quizProgress,
  quizReducer,
} from '../lib/quiz';

/** Time the "analysing" screen stays up before opening the swipe deck. */
const ANALYSIS_DELAY_MS = 1800;

/** "Guide-moi": the 4-question quiz, then the trip it creates opens in the swipe deck. */
export function useOnboardingQuiz() {
  const navigate = useNavigate();
  const guestId = useGuestId();
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submission = useMutation(
    trpc.onboarding.submit.mutationOptions({
      onSuccess: (data) => {
        setTimeout(() => {
          navigate({
            to: '/discovery',
            search: { tripId: data.tripId },
          });
        }, ANALYSIS_DELAY_MS);
      },
      onError: (err) => {
        setIsAnalyzing(false);
        setErrorMessage(err.message || 'Une erreur est survenue lors du calcul.');
      },
    }),
  );

  const goForward = () => {
    if (!isLastStep(state)) {
      dispatch({ type: 'next' });
      return;
    }
    setErrorMessage(null);
    setIsAnalyzing(true);
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
      progress: quizProgress(state),
    },
    canGoBack: state.stepIndex > 0,
    canContinue: canContinue(state),
    isLastStep: isLastStep(state),
    goBack: () => dispatch({ type: 'back' }),
    goForward,
    isAnalyzing,
    errorMessage,
  };
}
