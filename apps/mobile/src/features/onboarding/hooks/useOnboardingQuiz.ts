import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useReducer, useState } from 'react';

import { useHardwareBack } from '@/hooks/useHardwareBack';
import { useGuestId } from '@/lib/guest-id';
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

/** Time the progress bar takes to fill up to 100 % before the "analysing" screen shows. */
const COMPLETION_ANIMATION_MS = 400;
/** The "analysing" screen stays at least this long, even when the API answers at once. */
const MIN_ANALYSIS_MS = 4200;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** "Guide-moi": the 4-question quiz, then the trip it creates opens in the swipe deck. */
export function useOnboardingQuiz() {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const guestId = useGuestId();
  const [isFinishing, setIsFinishing] = useState(false);

  const submission = useMutation(trpc.onboarding.submit.mutationOptions());

  const isFirstStep = state.stepIndex === 0;

  const goBack = () => {
    if (isFinishing) return;
    if (isFirstStep) router.back();
    else dispatch({ type: 'back' });
  };

  // Android's back button walks the questions backwards instead of leaving the quiz.
  useHardwareBack(() => {
    if (isFinishing) return true;
    if (isFirstStep) return false;
    dispatch({ type: 'back' });
    return true;
  });

  const goForward = () => {
    if (!isLastStep(state)) {
      dispatch({ type: 'next' });
      return;
    }
    setIsFinishing(true);
    // shortcut: the timer is not cleared on unmount; leaving is blocked meanwhile (back buttons).
    setTimeout(() => {
      Promise.all([submission.mutateAsync({ ...state.answers, guestId }), wait(MIN_ANALYSIS_MS)])
        // Replace: going back from the deck should not reopen a submitted quiz.
        .then(([{ tripId }]) => router.replace({ pathname: '/discovery', params: { tripId } }))
        .catch(() => setIsFinishing(false));
    }, COMPLETION_ANIMATION_MS);
  };

  const question = currentQuestion(state);

  return {
    question,
    selected: state.answers[question] as string[],
    answers: state.answers,
    toggle: (option: string) => dispatch({ type: 'toggle', question, option }),
    step: {
      current: state.stepIndex + 1,
      total: QUIZ_QUESTIONS.length,
      progress: isFinishing ? 1 : quizProgress(state),
    },
    canContinue: canContinue(state) && !isFinishing,
    isLastStep: isLastStep(state),
    goBack,
    goForward,
    // Success keeps the "analysing" screen until the minimum time is up and the deck opens.
    isSubmitting: submission.isPending || submission.isSuccess,
    hasFailed: submission.isError,
  };
}
