/**
 * Publisher details shown on the legal pages (mentions légales / politique de confidentialité).
 * Values wrapped in [brackets] still have to be filled in before going live.
 */
export const LEGAL = {
  siteName: 'Seego',
  siteUrl: 'https://www.seego.fr',
  publisher: '[Raison sociale ou nom du responsable]',
  legalForm: '[Forme juridique et capital social, ou « Projet étudiant »]',
  address: '[Adresse postale du siège]',
  registration: '[RCS / SIREN, ou « Non immatriculé »]',
  publicationDirector: '[Nom du directeur de la publication]',
  contactEmail: '[contact@seego.fr]',
  apiHost: '[Hébergeur de l’API et de la base de données, avec son adresse]',
  lastUpdated: '2 novembre 2026',
} as const;

export const ROUTES = {
  home: '/',
  privacy: '/confidentialite',
  legalNotice: '/mentions-legales',
} as const;
