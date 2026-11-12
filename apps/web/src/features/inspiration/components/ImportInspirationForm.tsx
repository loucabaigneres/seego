import { trpc, type RouterOutputs } from '@/lib/trpc';
import { FIELD_CLASS, LABEL_CLASS } from '@/components/formStyles';
import { SelectField } from '@/components/SelectField';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Link2, Loader2, MapPin, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInspirationMutations } from '../hooks/useInspirationMutations';
import type { ImportInspirationValues } from '../lib/validation';
import { AI_UNAVAILABLE, CAPTION_UNAVAILABLE, importInspirationSchema } from '../lib/validation';

type ImportResult = RouterOutputs['inspiration']['analyzeFromUrl'];

interface ImportInspirationFormProps {
  onSuccess?: (result: ImportResult) => void;
  onCancel?: () => void;
  compact?: boolean;
  className?: string;
}

export function ImportInspirationForm({
  onSuccess,
  onCancel,
  compact = false,
  className = '',
}: ImportInspirationFormProps) {
  const [showCaptionField, setShowCaptionField] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tripId, setTripId] = useState('');
  const [addedTo, setAddedTo] = useState<{ tripId: string; count: number } | null>(null);

  const tripsQuery = useQuery(trpc.user.getTrips.queryOptions());
  const trips = tripsQuery.data ?? [];
  const effectiveTripId = tripId || trips[0]?.id || '';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ImportInspirationValues>({
    resolver: zodResolver(importInspirationSchema as never),
    defaultValues: { url: '', caption: '' },
  });

  const { addToTrip: addToTripMutation } = useInspirationMutations({
    onAddedToTrip: (data) => setAddedTo({ tripId: data.tripId, count: data.added }),
  });

  const analyzeMutation = useMutation(
    trpc.inspiration.analyzeFromUrl.mutationOptions({
      onSuccess: (data) => {
        setResult(data);
        setErrorMessage(null);
        setShowCaptionField(false);
        setAddedTo(null);
        reset({ url: '', caption: '' });
        onSuccess?.(data);
      },
      onError: (error) => {
        setResult(null);

        if (error.message === CAPTION_UNAVAILABLE) {
          // La récupération automatique a échoué : on déplie la saisie manuelle.
          setShowCaptionField(true);
          setErrorMessage(
            "Impossible de récupérer le contenu automatiquement. Colle la description ci-dessous pour lancer l'analyse.",
          );
          return;
        }

        if (error.message === AI_UNAVAILABLE) {
          setErrorMessage(
            "L'analyse IA n'est pas disponible pour le moment (configuration serveur manquante).",
          );
          return;
        }

        setErrorMessage(error.message);
      },
    }),
  );

  const onSubmit = (values: ImportInspirationValues) => {
    const caption = values.caption?.trim();
    analyzeMutation.mutate({ url: values.url, caption: caption || undefined });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`rounded-card border border-brand/15 bg-surface ${compact ? 'p-5' : 'p-6 sm:p-8'} ${className}`}
    >
      <div>
        <label htmlFor="inspirationUrl" className={LABEL_CLASS}>
          Lien TikTok ou Instagram
        </label>
        <div className="relative">
          <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            id="inspirationUrl"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://www.tiktok.com/@compte/video/..."
            className={`${FIELD_CLASS} pl-9`}
            {...register('url')}
          />
        </div>
        {errors.url && (
          <p className="mt-2 text-xs font-medium text-brand">{errors.url.message}</p>
        )}
      </div>

      {!showCaptionField && (
        <button
          type="button"
          onClick={() => setShowCaptionField(true)}
          className="mt-2 cursor-pointer text-xs font-semibold text-ink-muted underline underline-offset-2 transition hover:text-brand"
        >
          Un problème ?
        </button>
      )}

      {showCaptionField && (
        <div className="mt-4">
          <label
            htmlFor="inspirationCaption"
            className={LABEL_CLASS}
          >
            Colle la description du post
          </label>
          <textarea
            id="inspirationCaption"
            rows={compact ? 3 : 4}
            placeholder="Colle ici la légende de la publication, avec ses #hashtags…"
            className={`${FIELD_CLASS} resize-y`}
            {...register('caption')}
          />
          <p className="mt-2 text-xs text-ink-muted">
            Certaines publications (surtout sur Instagram) ne peuvent pas être lues automatiquement.
          </p>
          {errors.caption && (
            <p className="mt-2 text-xs font-medium text-brand">{errors.caption.message}</p>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-xl bg-brand/10 p-3 text-xs font-semibold text-brand">
          {errorMessage}
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4 rounded-xl bg-success/10 p-4">
          <p className="text-xs font-semibold text-success-text">
            ✓ Analysé depuis {result.inspiration.platform === 'tiktok' ? 'TikTok' : 'Instagram'}
          </p>
          {result.alreadyImported && (
            <p className="text-xs font-medium text-ink-muted">
              Cette vidéo avait déjà été analysée : voici son analyse (aucun doublon créé).
            </p>
          )}

          {result.inspiration.aiReport && (
            <div>
              <p className="text-xs font-bold tracking-wide text-ink uppercase">
                Compte rendu
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {result.inspiration.aiReport}
              </p>
            </div>
          )}

          {result.inspiration.extractedPlaces.length > 0 && (
            <div>
              <p className="text-xs font-bold tracking-wide text-ink uppercase">
                Lieux détectés
              </p>
              <ul className="mt-2 space-y-2">
                {result.inspiration.extractedPlaces.map((place, index) => (
                  <li
                    key={`${place.name}-${index}`}
                    className="flex gap-2 rounded-field border border-brand/15 bg-surface p-3"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{place.name}</p>
                      {place.address ? (
                        <p className="text-xs text-ink-secondary">{place.address}</p>
                      ) : (
                        [place.city, place.country].filter(Boolean).length > 0 && (
                          <p className="text-xs text-ink-secondary">
                            {[place.city, place.country].filter(Boolean).join(', ')}
                          </p>
                        )
                      )}
                      {place.description && (
                        <p className="mt-1 text-xs text-ink-muted">{place.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.inspiration.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.inspiration.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {result.inspiration.extractedPlaces.length > 0 && (
            <div className="border-t border-success/20 pt-3">
              {addedTo ? (
                <p className="text-xs font-semibold text-success-text">
                  ✓ {addedTo.count} lieu{addedTo.count > 1 ? 'x' : ''} ajouté
                  {addedTo.count > 1 ? 's' : ''} à ton voyage.{' '}
                  <Link
                    to="/trip/$tripId"
                    params={{ tripId: addedTo.tripId }}
                    className="font-bold text-ink underline underline-offset-2 hover:text-brand"
                  >
                    Voir le voyage
                  </Link>
                </p>
              ) : trips.length === 0 ? (
                <p className="text-xs font-medium text-ink-muted">
                  Crée d'abord un voyage pour y ajouter ces lieux.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <SelectField
                    value={effectiveTripId}
                    onChange={(e) => setTripId(e.target.value)}
                    className="max-w-[55vw] truncate sm:max-w-60"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title || t.destination || 'Voyage sans titre'}
                      </option>
                    ))}
                  </SelectField>
                  <button
                    type="button"
                    disabled={!effectiveTripId || addToTripMutation.isPending}
                    onClick={() =>
                      addToTripMutation.mutate({
                        tripId: effectiveTripId,
                        inspirationIds: [result.inspiration.id],
                      })
                    }
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-accent shadow-md shadow-brand/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
                  >
                    {addToTripMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" strokeWidth={3} />
                    )}
                    Ajouter au voyage
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-2xl border border-line-strong bg-background px-5 py-3.5 text-sm font-semibold text-ink-muted transition hover:border-brand/30 hover:text-brand active:scale-95"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={analyzeMutation.isPending}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cta py-3.5 text-sm font-bold text-ink shadow-lg shadow-cta/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
        >
          {analyzeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyse en cours…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyser l'inspiration
            </>
          )}
        </button>
      </div>
    </form>
  );
}
