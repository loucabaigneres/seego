import type * as z from 'zod';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type ValidationResult<T, Out> =
  | { success: true; data: Out }
  | { success: false; errors: FieldErrors<T> };

export function validate<S extends z.ZodObject>(
  schema: S,
  values: z.input<S>,
): ValidationResult<z.input<S>, z.output<S>> {
  const result = schema.safeParse(values);
  if (result.success) return { success: true, data: result.data };

  const errors: FieldErrors<z.input<S>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof z.input<S> | undefined;
    if (field !== undefined && !errors[field]) errors[field] = issue.message;
  }
  return { success: false, errors };
}
