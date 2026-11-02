import { LegalLayout, LegalSection, MailLink } from '../components/legal/LegalLayout';
import { LEGAL, ROUTES } from '../lib/legal';

export function LegalNotice() {
  return (
    <LegalLayout
      title="Mentions légales"
      intro={
        <p>
          Conformément à l’article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans
          l’économie numérique (LCEN), voici les informations relatives à l’éditeur et à
          l’hébergeur du site {LEGAL.siteUrl.replace('https://', '')}.
        </p>
      }
    >
      <LegalSection title="Éditeur du site">
        <p>
          {LEGAL.publisher}
          <br />
          {LEGAL.legalForm}
          <br />
          {LEGAL.address}
          <br />
          {LEGAL.registration}
          <br />
          Contact : <MailLink email={LEGAL.contactEmail} />
        </p>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>{LEGAL.publicationDirector}</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina,
          CA 91723, États-Unis (vercel.com).
        </p>
        <p>L’API et la base de données sont hébergées par {LEGAL.apiHost}.</p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L’ensemble des contenus du site (textes, logo, visuels, maquettes de l’application) est
          la propriété de {LEGAL.siteName}, sauf mention contraire. Toute reproduction ou
          représentation, totale ou partielle, sans autorisation préalable est interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Les informations sur la collecte et le traitement de tes données figurent dans notre{' '}
          <a
            href={ROUTES.privacy}
            className="font-semibold text-ink underline decoration-accent/50 underline-offset-2 hover:decoration-accent"
          >
            politique de confidentialité
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          {LEGAL.siteName} s’efforce de fournir des informations exactes, mais ne peut garantir
          l’absence d’erreur. Les fonctionnalités présentées concernent une application en cours de
          développement et peuvent évoluer d’ici son lancement.
        </p>
      </LegalSection>

      <LegalSection title="Droit applicable">
        <p>
          Les présentes mentions sont régies par le droit français. En cas de litige, et à défaut
          de résolution amiable, les tribunaux français sont compétents.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
