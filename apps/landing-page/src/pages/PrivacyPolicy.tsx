import { LegalLayout, LegalList, LegalSection, MailLink } from '../components/legal/LegalLayout';
import { analyticsEnabled, resetConsent } from '../lib/analytics';
import { LEGAL, ROUTES } from '../lib/legal';

export function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro={
        <p>
          Cette page explique quelles données {LEGAL.siteName} collecte sur{' '}
          <a href={ROUTES.home} className="font-semibold text-ink underline underline-offset-2">
            {LEGAL.siteUrl.replace('https://', '')}
          </a>
          , pourquoi, combien de temps elles sont conservées et comment exercer tes droits,
          conformément au Règlement général sur la protection des données (RGPD) et à la loi
          Informatique et Libertés.
        </p>
      }
    >
      <LegalSection title="1. Responsable du traitement">
        <p>
          Le responsable du traitement est {LEGAL.publisher}, {LEGAL.address}. Pour toute question
          relative à tes données, écris-nous à <MailLink email={LEGAL.contactEmail} />.
        </p>
      </LegalSection>

      <LegalSection title="2. Données collectées">
        <p>
          <strong>Liste d’attente.</strong> Quand tu t’inscris pour être prévenu du lancement, nous
          enregistrons :
        </p>
        <LegalList
          items={[
            'ton adresse e-mail ;',
            'la date de ton inscription ;',
            'des informations sur la provenance de ta visite : paramètres de campagne présents dans l’URL (utm_source, utm_medium, utm_campaign, utm_term, utm_content), page d’origine (referrer), adresse de la page d’inscription et formulaire utilisé.',
          ]}
        />
        <p>
          <strong>Mesure d’audience.</strong> Si tu l’acceptes via le bandeau prévu à cet effet,
          nous mesurons l’utilisation de la page avec PostHog (pages vues, clics, informations
          techniques sur le navigateur et l’appareil). Nous utilisons aussi Vercel Web Analytics,
          qui fournit des statistiques de fréquentation agrégées sans déposer de cookie.
        </p>
        <p>
          Ton adresse e-mail n’est jamais transmise aux outils de mesure d’audience.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalités et bases légales">
        <LegalList
          items={[
            <>
              <strong>Te prévenir du lancement de l’application</strong> et t’envoyer un e-mail de
              confirmation d’inscription : sur la base de ton consentement, donné en soumettant le
              formulaire.
            </>,
            <>
              <strong>Comprendre d’où viennent nos inscrits</strong> (efficacité de nos campagnes et
              de nos formulaires) : sur la base de notre intérêt légitime à mesurer nos actions de
              communication.
            </>,
            <>
              <strong>Mesurer et améliorer l’audience de la page</strong> avec PostHog : sur la
              base de ton consentement, que tu peux retirer à tout moment.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Destinataires et sous-traitants">
        <p>
          Tes données ne sont ni vendues ni louées. Elles sont accessibles uniquement à l’équipe
          Seego et aux prestataires techniques suivants, qui agissent pour notre compte :
        </p>
        <LegalList
          items={[
            <>
              <strong>Vercel Inc.</strong> (États-Unis) : hébergement du site et statistiques de
              fréquentation agrégées.
            </>,
            <>
              <strong>{LEGAL.apiHost}</strong> : hébergement de l’API et de la base de données où
              est enregistrée la liste d’attente.
            </>,
            <>
              <strong>Resend</strong> (États-Unis) : envoi des e-mails (confirmation
              d’inscription, annonce du lancement).
            </>,
            <>
              <strong>PostHog</strong> : mesure d’audience, avec un hébergement des données dans
              l’Union européenne, uniquement si tu y as consenti.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Transferts hors de l’Union européenne">
        <p>
          Certains prestataires sont établis aux États-Unis. Ces transferts sont encadrés par les
          clauses contractuelles types de la Commission européenne et, le cas échéant, par le Data
          Privacy Framework UE–États-Unis auquel ces prestataires adhèrent.
        </p>
      </LegalSection>

      <LegalSection title="6. Durée de conservation">
        <LegalList
          items={[
            'Liste d’attente : jusqu’à ta désinscription, et au plus tard 3 ans après notre dernier contact avec toi.',
            'Données de mesure d’audience PostHog : 13 mois maximum.',
            'Ton choix concernant les cookies : 6 mois, après quoi nous te le redemanderons.',
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Cookies et stockage local">
        <p>
          Aucun cookie de mesure d’audience n’est déposé sans ton accord : tant que tu n’as pas
          cliqué sur « Accepter », PostHog ne collecte rien. Refuser est aussi simple qu’accepter.
        </p>
        <p>
          Le site enregistre aussi, dans le stockage de session de ton navigateur, l’adresse avec
          laquelle tu viens de t’inscrire, pour t’afficher la confirmation. Cette information est
          effacée à la fermeture de l’onglet et n’est jamais envoyée à un tiers.
        </p>
        {analyticsEnabled && (
          <p>
            Tu peux modifier ton choix à tout moment :{' '}
            <button
              type="button"
              onClick={resetConsent}
              className="cursor-pointer font-semibold text-ink underline decoration-accent/50 underline-offset-2 hover:decoration-accent"
            >
              gérer mes cookies
            </button>
            .
          </p>
        )}
      </LegalSection>

      <LegalSection title="8. Tes droits">
        <p>Tu disposes à tout moment des droits suivants sur tes données :</p>
        <LegalList
          items={[
            'droit d’accès et de rectification ;',
            'droit à l’effacement (désinscription de la liste d’attente) ;',
            'droit d’opposition et de limitation du traitement ;',
            'droit à la portabilité ;',
            'droit de retirer ton consentement, sans que cela remette en cause les traitements déjà effectués ;',
            'droit de définir des directives sur le sort de tes données après ton décès.',
          ]}
        />
        <p>
          Pour les exercer, écris-nous à <MailLink email={LEGAL.contactEmail} />. Nous te
          répondrons dans un délai d’un mois.
        </p>
        <p>
          Si tu estimes que tes droits ne sont pas respectés, tu peux introduire une réclamation
          auprès de la CNIL (
          <a
            href="https://www.cnil.fr/fr/plaintes"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ink underline underline-offset-2"
          >
            cnil.fr
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="9. Sécurité">
        <p>
          Les échanges avec le site sont chiffrés (HTTPS) et l’accès à la base de données est
          réservé aux personnes qui en ont besoin pour faire fonctionner le service.
        </p>
      </LegalSection>

      <LegalSection title="10. Modifications">
        <p>
          Nous pouvons faire évoluer cette politique, notamment au lancement de l’application. La
          date de dernière mise à jour figure en haut de cette page.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
