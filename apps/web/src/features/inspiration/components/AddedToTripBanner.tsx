import { Link } from '@tanstack/react-router';

interface AddedToTripBannerProps {
  tripId: string;
  count: number;
}

/** Confirmation affichée après l'ajout de lieux à un voyage. */
export function AddedToTripBanner({ tripId, count }: AddedToTripBannerProps) {
  return (
    <div className="rounded-2xl bg-success/10 p-4 text-sm">
      {count > 0 ? (
        <p className="font-semibold text-success-text">
          ✓ {count} lieu{count > 1 ? 'x' : ''} ajouté
          {count > 1 ? 's' : ''} à ton voyage.{' '}
          <Link
            to="/trip/$tripId"
            params={{ tripId }}
            className="font-bold text-ink underline underline-offset-2 hover:text-brand"
          >
            Voir le voyage
          </Link>
        </p>
      ) : (
        <p className="font-semibold text-ink-muted">Aucun lieu à ajouter dans la sélection.</p>
      )}
    </div>
  );
}
