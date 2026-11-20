import * as Print from 'expo-print';

/** The browser has no share sheet for local files: its print dialog saves the PDF. */
export async function shareTripPdf(html: string, _fileName: string): Promise<void> {
  await Print.printAsync({ html });
}

/** `false`: the print dialog does not say whether the user saved. */
export async function downloadTripPdf(html: string, fileName: string): Promise<boolean> {
  await shareTripPdf(html, fileName);
  return false;
}
