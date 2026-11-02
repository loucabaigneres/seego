/** Shown while the quiz answers are turned into a trip. */
export function AnalyzingView() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-[#F2EDE8] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-sm border border-[#eee]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#FF4D4D]/20 border-t-[#FF4D4D]" />
        </div>
        <h2 className="text-xl font-bold text-[#1a1a1a]">Analyse de tes envies…</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#888]">
          Nous sélectionnons les meilleures destinations et activités selon tes critères.
        </p>
      </div>
    </div>
  );
}
