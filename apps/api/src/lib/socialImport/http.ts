// Instagram sert une page vide aux clients non navigateurs : on se présente comme un navigateur.
export const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Les posts photo TikTok n'ont pas d'oEmbed, et la page rend une coquille vide à un UA
// navigateur. En revanche, avec un UA de crawler social, TikTok renvoie un aperçu Open
// Graph (légende + image de couverture) : c'est ce qu'on exploite en repli.
export const CRAWLER_USER_AGENT =
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

export const FETCH_TIMEOUT_MS = 8000;
