import { useState } from 'react';
import type * as z from 'zod';

import { authErrorMessage, type AuthError } from '../lib/errors';
import { validate, type FieldErrors } from '../lib/validation';

interface UseAuthFormOptions<S extends z.ZodObject> {
  schema: S;
  initialValues: z.input<S>;
  /** The Better Auth call;
   *  resolves with its `error` (null on success). */
  request: (data: z.output<S>) => Promise<{ error: AuthError | null }>;
  /** Receives the submitted values, e.g. to sign in again once the e-mail is confirmed. */
  onSuccess: (data: z.output<S>) => void | Promise<void>;
  /** Resolves `true` when the form deals with this error itself (no message shown). */
  onError?: (error: AuthError, data: z.output<S>) => boolean | Promise<boolean>;
}

export function useAuthForm<S extends z.ZodObject>({
  schema,
  initialValues,
  request,
  onSuccess,
  onError,
}: UseAuthFormOptions<S>) {
  type Values = z.input<S>;

  const [values, setValues] = useState<Values>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Values>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = <K extends keyof Values>(field: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async () => {
    if (isSubmitting) return;
    setFormError(null);

    const result = validate(schema, values);
    if (!result.success) {
      setFieldErrors(result.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await request(result.data);
      if (error) {
        if (!(await onError?.(error, result.data))) setFormError(authErrorMessage(error));
        return;
      }
      await onSuccess(result.data);
    } catch {
      setFormError(authErrorMessage(null));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { values, setField, fieldErrors, formError, setFormError, isSubmitting, submit };
}
