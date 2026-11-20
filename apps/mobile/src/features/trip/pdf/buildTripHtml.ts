import { formatDate } from '@/domain/date';
import { categoryMeta, cleanDescription, parseWktPoint } from '@/domain/place';
import { daySummary, inPlanningOrder } from '@/domain/trip';
import { tripDisplayTitle, tripFacts } from '@/domain/trip-summary';
import { colors, radii, webFonts } from '@seego/ui';

export interface PdfActivity {
  id: string;
  title: string;
  locationName: string | null;
  description: string | null;
  coordinates: string | null;
  category: string | null;
  orderIndex: number;
  mainMediaUrl: string | null;
  sourceUrl: string | null;
}

export interface PdfDay {
  id: string;
  dayIndex: number;
  targetDate: string | null;
  activities: PdfActivity[];
}

export interface TripPdfInput {
  trip: {
    title: string | null;
    destination: string | null;
    startDate: string | null;
    durationDays: number | null;
  };
  /** Itinerary days only (dayIndex > 0). */
  itinerary: PdfDay[];
  coverImage: string | null;
}

// shortcut: the print WebView cannot reach the self-hosted files in @seego/ui/fonts, so the same
// families come from Google Fonts; inline them as base64 if offline export becomes a need.
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Frauncesfamily=Fraunces:ital,wght@0,400;1,400&family=Hanken+Grotesk:wght@400;600;700&display=block';
const SERIF = webFonts.display;
const SANS = webFonts.sans;

/** Catalogue and user text goes into HTML: it must never be read as markup. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only web links make it into `href` / `src` (no `javascript:`, no local files). */
function safeUrl(url: string | null): string | null {
  return url && /^https?:\/\//i.test(url.trim()) ? escapeHtml(url.trim()) : null;
}

/** "seego-rome-itineraire.pdf" — accents and punctuation dropped so every app accepts the name. */
export function pdfFileName(destination: string | null | undefined): string {
  const slug = (destination ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `seego-${slug || 'voyage'}-itineraire.pdf`;
}

function activityHtml(activity: PdfActivity, position: number): string {
  const meta = categoryMeta(activity.category);
  const point = parseWktPoint(activity.coordinates);
  const description = cleanDescription(activity.description);
  const image = safeUrl(activity.mainMediaUrl);
  const link = safeUrl(activity.sourceUrl);
  // Activities carry generic stock pictures: only places you actually go to get a thumbnail.
  const thumbnail =
    activity.category === 'activité'
      ? ''
      : image
        ? `<img class="thumb" src="${image}" alt="" />`
        : `<div class="thumb" style="background:${meta.colors.fill}"></div>`;

  return `
    <div class="place">
      <div class="index">${position}</div>
      ${thumbnail}
      <div class="place-body">
        <div class="place-head">
          <div class="place-title">${escapeHtml(activity.title)}</div>
          <span class="badge" style="background:${meta.colors.fill};color:${meta.colors.ink}">${escapeHtml(meta.label)}</span>
        </div>
        ${
          activity.locationName && activity.locationName !== activity.title
            ? `<div class="muted">${escapeHtml(activity.locationName)}</div>`
            : ''
        }
        ${point ? `<div class="gps">GPS : ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}</div>` : ''}
        ${description ? `<div class="desc">${escapeHtml(description)}</div>` : ''}
        ${link ? `<a class="link" href="${link}">Voir l’offre en ligne</a>` : ''}
      </div>
    </div>`;
}

function dayHtml(day: PdfDay): string {
  const activities = inPlanningOrder(day.activities);
  const summary = daySummary(activities);
  const date = formatDate(day.targetDate, 'long');

  return `
    <section class="day">
      <div class="day-head">
        <div class="day-head-left">
          <span class="day-pill">Jour ${day.dayIndex}</span>
          ${date ? `<span class="muted">${escapeHtml(date)}</span>` : ''}
        </div>
        ${summary ? `<span class="muted">${escapeHtml(summary)}</span>` : ''}
      </div>
      <div class="day-body">${activities.map((a, i) => activityHtml(a, i + 1)).join('')}</div>
    </section>`;
}

/** The trip as a printable A4 HTML page, in the Seego charte, for `expo-print`. */
export function buildTripHtml({ trip, itinerary, coverImage }: TripPdfInput): string {
  const plannedCount = itinerary.reduce((total, day) => total + day.activities.length, 0);
  const cover = safeUrl(coverImage);
  const title = escapeHtml(tripDisplayTitle(trip));

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<link rel="stylesheet" href="${FONTS_URL}" />
<style>
  @page { size: A4; margin: 32px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  /* Explicit paper colour: a dark-mode WebView would otherwise print on black. */
  html { color-scheme: light; background: ${colors.background};
    -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: ${SANS}; font-size: 11px; line-height: 1.45; color: ${colors.ink.DEFAULT}; }
  .hero { position: relative; height: 230px; border-radius: ${radii.card}px; overflow: hidden;
    background: ${colors.ink.DEFAULT}; margin-bottom: 24px; }
  .hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .hero-scrim { position: absolute; inset: 0;
    background: linear-gradient(to top, ${colors.ink.DEFAULT} 0%, ${colors.scrim} 45%, transparent 80%); }
  .hero-content { position: absolute; left: 22px; right: 22px; bottom: 20px; color: ${colors.ink.inverse}; }
  .hero-destination { font-weight: 600; color: ${colors.accent}; margin-bottom: 2px; }
  .hero-title { font-family: ${SERIF}; font-size: 34px; line-height: 1.05; }
  .pills { margin-top: 10px; }
  .pill { display: inline-block; padding: 3px 10px; margin-right: 6px; border-radius: 999px;
    border: 1px solid ${colors.ink.inverse}; font-size: 9px; }
  .overline { font-size: 9px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
    color: ${colors.ink.muted}; margin-bottom: 10px; }
  .day { break-inside: avoid; page-break-inside: avoid; background: ${colors.surface};
    border-radius: ${radii.card}px; padding: 10px; margin-bottom: 14px; }
  .day-head { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 10px; }
  .day-head-left { display: flex; align-items: center; gap: 8px; }
  .day-pill { background: ${colors.brand}; color: ${colors.ink.inverse}; font-weight: 700;
    border-radius: 999px; padding: 3px 10px; font-size: 10px; }
  .muted { color: ${colors.ink.muted}; font-size: 9.5px; }
  .day-body { display: flex; flex-direction: column; gap: 6px; }
  .place { display: flex; gap: 9px; background: ${colors.background};
    border-radius: ${radii.field}px; padding: 9px; }
  .index { flex: none; width: 18px; height: 18px; border-radius: 999px; background: ${colors.surface};
    color: ${colors.brand}; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .thumb { flex: none; width: 56px; height: 56px; border-radius: 10px; object-fit: cover; }
  .place-body { flex: 1; min-width: 0; }
  .place-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 2px; }
  .place-title { font-weight: 700; font-size: 11.5px; }
  .badge { flex: none; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px;
    border-radius: 999px; padding: 2px 8px; }
  .gps { color: ${colors.ink.muted}; font-size: 8.5px; margin-top: 1px; }
  .desc { color: ${colors.ink.secondary}; font-size: 9.5px; margin-top: 3px; }
  .link { display: inline-block; margin-top: 4px; color: ${colors.brand}; font-weight: 600;
    font-size: 9.5px; text-decoration: none; }
  .footer { margin-top: 18px; text-align: right; font-weight: 700; color: ${colors.ink.muted}; }
  .footer span { color: ${colors.cta}; }
</style>
</head>
<body>
  <header class="hero">
    ${cover ? `<img src="${cover}" alt="" />` : ''}
    <div class="hero-scrim"></div>
    <div class="hero-content">
      ${trip.destination ? `<div class="hero-destination">${escapeHtml(trip.destination)}</div>` : ''}
      <h1 class="hero-title">${title}</h1>
      <div class="pills">${tripFacts(trip, plannedCount, 'long')
        .map((fact) => `<span class="pill">${escapeHtml(fact)}</span>`)
        .join('')}</div>
    </div>
  </header>

  <div class="overline">Jour par jour</div>
  ${itinerary.map(dayHtml).join('')}

  <div class="footer">Seego<span>.</span></div>
</body>
</html>`;
}
