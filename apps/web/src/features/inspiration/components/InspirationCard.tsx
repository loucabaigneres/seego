import { Check, ExternalLink, MapPin, Trash2 } from 'lucide-react';
import { inspirationTitle, placeLocation, typeLabel, type Inspiration } from '../lib/inspiration';

interface InspirationCardProps {
  item: Inspiration;
  isSelected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

/** Une publication analysée : sélectionnable dès qu'elle contient au moins un lieu. */
export function InspirationCard({ item, isSelected, onToggle, onDelete }: InspirationCardProps) {
  const selectable = item.extractedPlaces.length > 0;
  const label = typeLabel(item.type);

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
        isSelected ? 'border-[#FF4D4D] ring-2 ring-[#FF4D4D]/20' : 'border-[#eee]'
      }`}
    >
      <div className="flex items-start gap-3">
        {selectable ? (
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={isSelected}
            aria-label={isSelected ? 'Désélectionner' : 'Sélectionner'}
            className={`mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition ${
              isSelected
                ? 'border-[#FF4D4D] bg-[#FF4D4D] text-white'
                : 'border-[#ccc] bg-white hover:border-[#FF4D4D]'
            }`}
          >
            {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </button>
        ) : (
          <span
            className="mt-0.5 h-5 w-5 shrink-0 rounded-md border border-dashed border-[#ddd]"
            title="Aucun lieu détecté : rien à ajouter à un voyage."
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#1a1a1a]">{inspirationTitle(item)}</p>
              <a
                href={item.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-[#888] hover:text-[#FF4D4D]"
              >
                <ExternalLink className="h-3 w-3" />
                Voir la publication
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {label && (
                <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-bold text-[#3b5bdb]">
                  {label}
                </span>
              )}
              <span className="rounded-full bg-[#fee] px-3 py-1 text-xs font-bold text-[#FF4D4D] capitalize">
                {item.platform}
              </span>
              <button
                type="button"
                onClick={onDelete}
                aria-label="Supprimer cette publication"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#eee] text-[#bbb] transition hover:border-[#FF4D4D] hover:text-[#FF4D4D]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {item.aiReport ? (
            <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-[#555]">{item.aiReport}</p>
          ) : (
            item.description && (
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#555]">
                {item.description}
              </p>
            )
          )}

          {item.extractedPlaces.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {item.extractedPlaces.map((place, index) => {
                const location = placeLocation(place);
                return (
                  <li key={`${place.name}-${index}`} className="flex items-start gap-2 text-xs">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF4D4D]" />
                    <span className="text-[#1a1a1a]">
                      <span className="font-bold">{place.name}</span>
                      {location && ` — ${location}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F2EDE8] px-3 py-1 text-xs font-semibold text-[#555]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
