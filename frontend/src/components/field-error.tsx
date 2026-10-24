import type { AnyFieldApi } from '@tanstack/react-form';

function toMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Invalid value';
}

/**
 * Displays a field error message.
 * @author Axel Nana <ax.lnana@outlook.com>
 */
export function FieldError({ field }: { field: AnyFieldApi }) {
  const { isTouched, errors } = field.state.meta;
  const showErrors =
    (isTouched || field.form.state.submissionAttempts > 0) && errors.length > 0;
  if (!showErrors) return null;

  return (
    <p role="alert" className="text-sm text-destructive">
      {toMessage(errors[0])}
    </p>
  );
}
