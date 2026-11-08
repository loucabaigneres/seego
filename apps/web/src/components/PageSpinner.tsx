/** Full-page loading state: a spinner and a short message. */
export function PageSpinner({ label }: { label: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      <p className="text-sm font-medium text-ink-muted">{label}</p>
    </div>
  );
}
