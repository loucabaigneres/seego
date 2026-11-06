import { isRunningInExpoGo } from 'expo';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/** A4 at 72 PPI. */
const A4 = { width: 595, height: 842 };
/** iOS only; Android takes the `@page` margin of the HTML (same value). */
const MARGINS = { top: 32, right: 32, bottom: 32, left: 32 };

/** Renders the HTML to a PDF named `fileName` in the app's cache. */
async function writeTripPdf(html: string, fileName: string): Promise<File> {
  const { base64 } = await Print.printToFileAsync({
    html,
    ...A4,
    margins: MARGINS,
    base64: true,
  });
  if (!base64) throw new Error('Print returned no PDF data');

  // expo-print names its file at random, and Expo Go forbids moving it (outside the app's
  // scoped folder): we write the bytes again under a readable name instead.
  const pdf = new File(Paths.cache, fileName);
  pdf.write(base64, { encoding: 'base64' });
  return pdf;
}

/** Opens the share sheet on the PDF (mail, messages, Drive…). */
export async function shareTripPdf(html: string, fileName: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing unavailable on this device');
  }
  const pdf = await writeTripPdf(html, fileName);
  await Sharing.shareAsync(pdf.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Partager ton itinéraire',
  });
}

/** MediaStore lets an app add to Downloads without any permission from Android 10 (API 29). */
const MEDIA_STORE_MIN_API = 29;

/**
 * Saves the PDF on the device; resolves `true` when it went straight to Downloads.
 * - Android app build: written to Downloads in one tap (MediaStore, via react-native-blob-util).
 * - Expo Go (no such native module) and Android < 10: the system print dialog, whose
 *   "Save as PDF" printer opens the Files save screen.
 * - iOS has no downloads folder: its share sheet offers "Save to Files".
 *
 * shortcut: the MediaStore path never runs in Expo Go; test it on an Android build before release.
 */
export async function downloadTripPdf(html: string, fileName: string): Promise<boolean> {
  if (Platform.OS !== 'android') {
    await shareTripPdf(html, fileName);
    return false;
  }
  const pdf = await writeTripPdf(html, fileName);

  if (!isRunningInExpoGo() && Number(Platform.Version) >= MEDIA_STORE_MIN_API) {
    // Loaded on demand: Expo Go has no such native module and would crash on a static import.
    const { default: BlobUtil } = await import('react-native-blob-util');
    // The native side reads `name`; the published type calls it `path`.
    const entry = { name: fileName, path: fileName, parentFolder: '', mimeType: 'application/pdf' };
    await BlobUtil.MediaCollection.copyToMediaStore(entry, 'Download', pdf.uri);
    return true;
  }

  // Printing the file rather than the HTML: Android proposes its name instead of "Printing".
  await Print.printAsync({ uri: pdf.uri });
  return false;
}
