import { Button } from '@/components/ui/button';

/** Error state with a retry action (every query must offer one). */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border px-6 py-12 text-center">
      <p className="text-body text-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Réessayer
      </Button>
    </div>
  );
}
