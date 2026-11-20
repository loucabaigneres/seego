import { clipboardSuggestion, extractSupportedUrl, importUrlError } from './import-url';

describe('extractSupportedUrl', () => {
  it('finds the link inside the text TikTok shares on Android', () => {
    expect(
      extractSupportedUrl(
        'Regarde cette vidéo de @lea sur TikTok ! https://vm.tiktok.com/ZMabc123/',
      ),
    ).toBe('https://vm.tiktok.com/ZMabc123/');
  });

  it('keeps Instagram query strings and drops trailing punctuation', () => {
    expect(
      extractSupportedUrl('Trop beau : https://www.instagram.com/reel/C1x2y3/?igsh=abc.'),
    ).toBe('https://www.instagram.com/reel/C1x2y3/?igsh=abc');
  });

  it('accepts a bare link', () => {
    expect(extractSupportedUrl('https://www.tiktok.com/@lea/video/123')).toBe(
      'https://www.tiktok.com/@lea/video/123',
    );
  });

  it('skips unsupported hosts, including look-alikes', () => {
    expect(extractSupportedUrl('https://youtube.com/watch?v=1')).toBeNull();
    expect(extractSupportedUrl('https://nottiktok.com/video/1')).toBeNull();
    expect(extractSupportedUrl('https://youtube.com/x puis https://vt.tiktok.com/ZS1/')).toBe(
      'https://vt.tiktok.com/ZS1/',
    );
  });

  it('returns null without a link', () => {
    expect(extractSupportedUrl('tiktok.com/@lea')).toBeNull();
    expect(extractSupportedUrl('')).toBeNull();
  });
});

describe('importUrlError', () => {
  it('asks for a link, rejects other platforms, accepts supported ones', () => {
    expect(importUrlError('  ')).toBe('Colle le lien d’une vidéo TikTok ou Instagram.');
    expect(importUrlError('https://youtube.com/watch?v=1')).toMatch(/TikTok et Instagram/);
    expect(importUrlError('https://instagr.am/p/abc')).toBeNull();
  });
});

describe('clipboardSuggestion', () => {
  it('suggests a copied TikTok link once', () => {
    const link = 'https://vm.tiktok.com/ZMabc/';
    expect(clipboardSuggestion(`Regarde ${link}`, new Set())).toBe(link);
    expect(clipboardSuggestion(link, new Set([link]))).toBeNull();
  });

  it('ignores other texts', () => {
    expect(clipboardSuggestion('code promo SEEGO10', new Set())).toBeNull();
    expect(clipboardSuggestion('https://youtube.com/x', new Set())).toBeNull();
  });
});
