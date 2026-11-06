/** Shown while the quiz answers are turned into a trip. */
export function AnalyzingView() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-card bg-surface p-10 text-center border border-brand/15">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-card border border-brand/15 bg-surface">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
        </div>
        <h2 className="text-xl font-display font-normal text-ink">Analyse de tes envies…</h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Nous sélectionnons les meilleures destinations et activités selon tes critères.
        </p>
      </div>
    </div>
  );
}
