export function SubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-2xl bg-cta py-3.5 text-sm font-bold text-ink shadow-lg shadow-cta/25 hover:brightness-105 active:scale-95 disabled:opacity-50 transition cursor-pointer"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
