import { LEGAL } from '../lib/legal';
import { LegalLayout, LegalSection, MailLink, PrivacyLink } from './LegalLayout';

export function LegalNotice() {
  return (
    <LegalLayout
      title="Mentions légales"
      intro={
        <p>
          Conformément à l’article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans
          l’économie numérique (LCEN), voici les informations relatives à l’éditeur et aux
          hébergeurs de l’application {LEGAL.appHost}.
        </p>
      }
    >
      <LegalSection title="Éditeur">
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
          L’application web est hébergée par <strong>Vercel Inc.</strong>, 440 N Barranca Ave
          #4133, Covina, CA 91723, États-Unis (vercel.com).
        </p>
        <p>
          L’API est hébergée par <strong>Render Services, Inc.</strong> (render.com) et la base de
          données par <strong>Supabase, Inc.</strong> (supabase.com).
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L’ensemble des contenus de l’application (textes, logo, visuels, interface) est la
          propriété de {LEGAL.siteName}, sauf mention contraire. Les photos proviennent
          d’Unsplash, les fonds de carte d’OpenStreetMap (© les contributeurs d’OpenStreetMap), et
          les publications que tu importes restent la propriété de leurs auteurs. Toute
          reproduction ou représentation, totale ou partielle, sans autorisation préalable est
          interdite.
        </p>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <p>
          Les informations sur la collecte et le traitement de tes données figurent dans notre{' '}
          <PrivacyLink>politique de confidentialité</PrivacyLink>.
        </p>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <p>
          Les itinéraires et suggestions de Seego sont fournis à titre indicatif : horaires,
          tarifs et disponibilités des lieux peuvent changer. Pense à les vérifier avant de
          partir. {LEGAL.siteName} s’efforce de fournir des informations exactes, mais ne peut
          garantir l’absence d’erreur.
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
