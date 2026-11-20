import { buildTripHtml, escapeHtml, pdfFileName, type PdfActivity } from './buildTripHtml';

const place = (overrides: Partial<PdfActivity>): PdfActivity => ({
  id: 'p',
  title: 'Lieu',
  locationName: null,
  description: null,
  coordinates: null,
  category: 'restaurant',
  orderIndex: 1,
  mainMediaUrl: null,
  sourceUrl: null,
  ...overrides,
});

const trip = { title: 'Week-end à Rome', destination: 'Rome', startDate: null, durationDays: 2 };

const html = (activities: PdfActivity[], coverImage: string | null = null) =>
  buildTripHtml({
    trip,
    itinerary: [{ id: 'd1', dayIndex: 1, targetDate: null, activities }],
    coverImage,
  });

describe('buildTripHtml', () => {
  it('escapes catalogue text so it cannot inject markup', () => {
    const out = html([place({ title: '<script>alert(1)</script>', description: '"Top" & co' })]);
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(out).toContain('&quot;Top&quot; &amp; co');
  });

  it('only links and loads web URLs', () => {
    const out = html([
      place({ sourceUrl: 'javascript:alert(1)', mainMediaUrl: 'file:///etc/passwd' }),
      place({ id: 'b', sourceUrl: 'https://booking.com/x?a=1&b=2' }),
    ]);
    expect(out).not.toContain('javascript:');
    expect(out).not.toContain('file://');
    expect(out).toContain('href="https://booking.com/x?a=1&amp;b=2"');
  });

  it('lists places in planning order, numbered from 1', () => {
    const out = html([
      place({ id: 'b', title: 'Dîner', orderIndex: 3 }),
      place({ id: 'a', title: 'Hôtel', category: 'hotel', orderIndex: 1 }),
    ]);
    expect(out.indexOf('Hôtel')).toBeLessThan(out.indexOf('Dîner'));
    expect(out).toContain('<div class="index">1</div>');
    expect(out).toContain('<div class="index">2</div>');
  });

  it('gives a thumbnail to places but not to activities', () => {
    const out = html([
      place({ category: 'activité', mainMediaUrl: 'https://img.test/activity.jpg' }),
      place({ id: 'r', mainMediaUrl: 'https://img.test/restaurant.jpg' }),
    ]);
    expect(out).not.toContain('activity.jpg');
    expect(out).toContain('src="https://img.test/restaurant.jpg"');
  });

  it('prints coordinates and the trip facts', () => {
    const out = html([place({ coordinates: 'POINT(12.4922 41.8902)' })]);
    expect(out).toContain('GPS : 41.89020, 12.49220');
    expect(out).toContain('2 jours');
    expect(out).toContain('1 étape');
  });

  it('renders a trip without cover photo nor planned places', () => {
    const out = html([]);
    expect(out).toContain('Week-end à Rome');
    expect(out).not.toContain('<img');
  });
});

describe('escapeHtml', () => {
  it('escapes quotes for attributes', () => {
    expect(escapeHtml(`a'b"c`)).toBe('a&#39;b&quot;c');
  });
});

describe('pdfFileName', () => {
  it('slugs the destination', () => {
    expect(pdfFileName('Rome')).toBe('seego-rome-itineraire.pdf');
    expect(pdfFileName('Saint-Jean-de-Luz, Pays basque')).toBe(
      'seego-saint-jean-de-luz-pays-basque-itineraire.pdf',
    );
    expect(pdfFileName('Séville')).toBe('seego-seville-itineraire.pdf');
  });

  it('falls back when there is no usable destination', () => {
    expect(pdfFileName(null)).toBe('seego-voyage-itineraire.pdf');
    expect(pdfFileName('  ')).toBe('seego-voyage-itineraire.pdf');
  });
});
