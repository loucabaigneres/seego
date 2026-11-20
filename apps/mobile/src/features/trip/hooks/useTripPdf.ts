import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { buildTripHtml, pdfFileName, type TripPdfInput } from '../pdf/buildTripHtml';
import { downloadTripPdf, shareTripPdf } from '../pdf/exportTripPdf';

export type PdfAction = 'download' | 'share';

/** `true` when the PDF went straight to Downloads. */
const EXPORTS: Record<PdfAction, (html: string, fileName: string) => Promise<boolean | void>> = {
  download: downloadTripPdf,
  share: shareTripPdf,
};

/**
 * The PDF of the saved itinerary (never an edit draft): a sheet to pick between downloading and
 * sharing it, then the export.
 */
export function useTripPdf(input: TripPdfInput | null) {
  const [isChoosing, setIsChoosing] = useState(false);
  const exporting = useMutation({
    mutationFn: ({ action, pdf }: { action: PdfAction; pdf: TripPdfInput }) =>
      EXPORTS[action](buildTripHtml(pdf), pdfFileName(pdf.trip.destination)),
  });

  return {
    isChoosing,
    choose: () => {
      exporting.reset();
      setIsChoosing(true);
    },
    dismiss: () => setIsChoosing(false),
    run: (action: PdfAction) => {
      setIsChoosing(false);
      if (input) exporting.mutate({ action, pdf: input });
    },
    isExporting: exporting.isPending,
    savedMessage: exporting.data === true ? 'PDF enregistré dans Téléchargements.' : null,
    errorMessage: exporting.isError
      ? 'Impossible de créer le PDF. Réessaie dans un instant.'
      : null,
  };
}
