import { PDFDownloadLink } from '@react-pdf/renderer'
import type { Day, Trip } from '../types'
import { TripPdfDocument } from './TripPdf'

interface ItineraryHeaderProps {
  trip: Trip
  days: Day[]
  isEditing: boolean
  onStartEditing: () => void
}

/** "Jour par jour" title with the edit and PDF export actions (hidden while editing). */
export function ItineraryHeader({ trip, days, isEditing, onStartEditing }: ItineraryHeaderProps) {
  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#888]">
          Jour par jour
        </h2>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onStartEditing}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ddd] bg-white px-4 py-2 text-xs font-semibold text-[#1a1a1a] transition hover:border-[#FF4D4D] hover:text-[#FF4D4D] active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.2 5.2 3.6 3.6M4 20l4.2-.9L19.4 7.9a1.8 1.8 0 0 0 0-2.6l-.7-.7a1.8 1.8 0 0 0-2.6 0L4.9 15.8 4 20Z" />
              </svg>
              Modifier le planning
            </button>
            <PDFDownloadLink
              document={<TripPdfDocument trip={trip} days={days} />}
              fileName={`${trip.destination ?? 'voyage'}-itineraire.pdf`}
            >
              {({ loading }) => (
                <button
                  type="button"
                  disabled={loading}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ddd] bg-white px-4 py-2 text-xs font-semibold text-[#1a1a1a] transition hover:border-[#FF4D4D] hover:text-[#FF4D4D] active:scale-95 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />
                  </svg>
                  {loading ? 'Préparation…' : 'PDF'}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}
      </div>

      {isEditing && (
        <p className="mt-3 rounded-2xl border border-[rgba(255,77,77,.25)] bg-[rgba(255,77,77,.08)] px-4 py-3 text-xs leading-relaxed text-[#555]">
          Réordonne, déplace ou supprime des lieux, puis enregistre. L'hébergement est commun
          à tout le séjour : utilise « Changer » hors édition pour le remplacer.
        </p>
      )}
    </>
  )
}
