import { Link } from '@tanstack/react-router';

interface AddedToTripBannerProps {
  tripId: string;
  count: number;
}

/** Confirmation affichée après l'ajout de lieux à un voyage. */
export function AddedToTripBanner({ tripId, count }: AddedToTripBannerProps) {
  return (
    <div className="rounded-2xl bg-[#e8f8f0] p-4 text-sm">
      {count > 0 ? (
        <p className="font-semibold text-[#2ecc71]">
          ✓ {count} lieu{count > 1 ? 'x' : ''} ajouté
          {count > 1 ? 's' : ''} à ton voyage.{' '}
          <Link
            to="/trip/$tripId"
            params={{ tripId }}
            className="font-bold text-[#1a1a1a] underline underline-offset-2 hover:text-[#FF4D4D]"
          >
            Voir le voyage
          </Link>
        </p>
      ) : (
        <p className="font-semibold text-[#888]">Aucun lieu à ajouter dans la sélection.</p>
      )}
    </div>
  );
}
