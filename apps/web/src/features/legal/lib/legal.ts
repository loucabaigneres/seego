/**
 * Publisher details shown on the legal pages (mentions légales / politique de confidentialité).
 * Values wrapped in [brackets] still have to be filled in before going live.
 * Keep in sync with apps/landing-page/src/lib/legal.ts (same publisher).
 */
export const LEGAL = {
  siteName: 'Seego',
  appHost: 'app.seego.fr',
  publisher: '[Raison sociale ou nom du responsable]',
  legalForm: '[Forme juridique et capital social, ou « Projet étudiant »]',
  address: '[Adresse postale du siège]',
  registration: '[RCS / SIREN, ou « Non immatriculé »]',
  publicationDirector: '[Nom du directeur de la publication]',
  contactEmail: '[contact@seego.fr]',
  lastUpdated: '20 novembre 2026',
} as const;
