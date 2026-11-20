import { analyticsEnabled, resetConsent } from '@/lib/analytics';
import { LEGAL } from '../lib/legal';
import { LegalLayout, LegalList, LegalSection, MailLink } from './LegalLayout';

export function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      intro={
        <p>
          Cette page explique quelles données {LEGAL.siteName} traite quand tu utilises
          l’application web ({LEGAL.appHost}), pourquoi, combien de temps elles sont conservées et
          comment exercer tes droits, conformément au Règlement général sur la protection des
          données (RGPD) et à la loi Informatique et Libertés.
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
          <strong>Sans compte.</strong> Tu peux utiliser Seego sans t’inscrire. Ton navigateur
          reçoit alors un identifiant invité aléatoire, auquel sont rattachés tes réponses au
          questionnaire, tes swipes et tes voyages. Si tu crées un compte ensuite, ces données y
          sont transférées.
        </p>
        <p>
          <strong>Ton compte.</strong> Ton nom, ton adresse e-mail, ton mot de passe (enregistré
          uniquement sous forme chiffrée, jamais en clair), la date de création du compte et la
          confirmation de ton adresse e-mail.
        </p>
        <p>
          <strong>Tes sessions.</strong> À chaque connexion, nous enregistrons l’adresse IP et le
          navigateur utilisés, pour sécuriser ton compte.
        </p>
        <p>
          <strong>Tes voyages.</strong> Tes préférences de voyage (paysages, ambiances, climats,
          avec qui tu voyages), les lieux que tu aimes ou passes en swipant, et les voyages que tu
          configures : destination, dates, nombre de voyageurs, itinéraire et activités.
        </p>
        <p>
          <strong>Les voyages de groupe.</strong> Quand tu crées ou rejoins un voyage de groupe,
          les autres membres voient ton nom et le contenu du voyage partagé.
        </p>
        <p>
          <strong>Les inspirations importées.</strong> Quand tu colles le lien d’une publication
          Instagram ou TikTok, nous récupérons son contenu public (texte, hashtags, sous-titres,
          image) pour en extraire les lieux, puis nous enregistrons le lien et le résultat dans
          ton espace.
        </p>
        <p>
          <strong>Mesure d’audience.</strong> Si tu l’acceptes via le bandeau prévu à cet effet,
          nous mesurons l’utilisation de l’application avec PostHog (pages vues, étapes du
          parcours, informations techniques sur le navigateur et l’appareil). Une fois connecté,
          ces statistiques sont rattachées à l’identifiant technique de ton compte, jamais à ton
          nom ni à ton adresse e-mail. Nous conservons aussi la provenance de ta première visite
          (paramètres de campagne présents dans l’URL, comme utm_source, domaine du site d’origine
          et page d’arrivée) pour savoir quels canaux font connaître Seego.
        </p>
        <p>
          Tant que tu n’as pas répondu au bandeau, ou si tu refuses, PostHog compte seulement les
          visites de façon anonyme : pages vues, provenance et informations techniques, sans
          cookie ni stockage sur ton appareil. Ton navigateur est reconnu le temps d’une journée à
          partir d’une empreinte calculée par PostHog (adresse IP et navigateur, renouvelée chaque
          jour). Cette mesure n’est jamais rattachée à ton compte et ne comprend aucun
          enregistrement de navigation. Nous utilisons aussi Vercel Web Analytics, qui fournit des
          statistiques de fréquentation agrégées sans déposer de cookie.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalités et bases légales">
        <LegalList
          items={[
            <>
              <strong>Fournir le service</strong> (questionnaire, swipe, création d’itinéraires,
              voyages de groupe, import d’inspirations, export PDF) et{' '}
              <strong>gérer ton compte</strong> (inscription, confirmation de l’e-mail,
              réinitialisation du mot de passe) : exécution du contrat qui nous lie quand tu
              utilises Seego.
            </>,
            <>
              <strong>Sécuriser les comptes</strong> et prévenir les abus : intérêt légitime.
            </>,
            <>
              <strong>Mesurer et améliorer l’application</strong> avec PostHog : ton
              consentement, que tu peux retirer à tout moment.
            </>,
            <>
              <strong>Compter les visites de façon anonyme et sans cookie</strong> (avant ou sans
              ton consentement) : intérêt légitime à connaître la fréquentation de Seego et les
              canaux qui le font connaître.
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
              <strong>Vercel Inc.</strong> (États-Unis) : hébergement de l’application web et
              statistiques de fréquentation agrégées.
            </>,
            <>
              <strong>Render Services, Inc.</strong> (États-Unis) : hébergement de l’API.
            </>,
            <>
              <strong>Supabase, Inc.</strong> : hébergement de la base de données.
            </>,
            <>
              <strong>Resend</strong> (États-Unis) : envoi des e-mails (code de confirmation,
              réinitialisation du mot de passe).
            </>,
            <>
              <strong>Google</strong> (modèle d’IA Gemini) : analyse du contenu public des
              publications que tu importes. Seul ce contenu lui est transmis, jamais les
              informations de ton compte.
            </>,
            <>
              <strong>PostHog</strong> : mesure d’audience, avec un hébergement des données dans
              l’Union européenne : mesure détaillée si tu y as consenti, sinon comptage anonyme
              des visites sans cookie.
            </>,
          ]}
        />
        <p>
          Pour afficher les cartes et les photos, ton navigateur charge directement des contenus
          depuis OpenStreetMap et Unsplash, qui reçoivent à cette occasion ton adresse IP.
        </p>
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
            'Compte, préférences, voyages et inspirations : tant que ton compte existe. Ils sont effacés quand tu demandes sa suppression.',
            'Session de connexion : elle expire après 7 jours sans utilisation.',
            'Codes de confirmation envoyés par e-mail : 10 minutes.',
            'Données de mesure d’audience PostHog : 13 mois maximum.',
            'Ton choix concernant les cookies : 6 mois, après quoi nous te le redemanderons.',
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Cookies et stockage local">
        <p>
          Certains éléments sont indispensables au fonctionnement de l’application et ne
          nécessitent pas ton accord : le cookie de session qui te garde connecté, et
          l’identifiant invité enregistré dans le stockage local de ton navigateur.
        </p>
        <p>
          Aucun cookie de mesure d’audience n’est déposé sans ton accord : tant que tu n’as pas
          cliqué sur « Accepter », PostHog ne stocke rien sur ton appareil et se limite au comptage
          anonyme des visites décrit plus haut. Refuser est aussi simple qu’accepter.
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
            'droit d’accès et de rectification (ton nom est modifiable depuis ton espace) ;',
            'droit à l’effacement, y compris la suppression de ton compte ;',
            'droit d’opposition et de limitation du traitement ;',
            'droit à la portabilité ;',
            'droit de retirer ton consentement, sans que cela remette en cause les traitements déjà effectués ;',
            'droit de définir des directives sur le sort de tes données après ton décès.',
          ]}
        />
        <p>
          Pour les exercer, écris-nous à <MailLink email={LEGAL.contactEmail} /> depuis l’adresse
          associée à ton compte. Nous te répondrons dans un délai d’un mois.
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
          Les échanges avec l’application sont chiffrés (HTTPS), les mots de passe sont hachés et
          l’accès à la base de données est réservé aux personnes qui en ont besoin pour faire
          fonctionner le service.
        </p>
      </LegalSection>

      <LegalSection title="10. Modifications">
        <p>
          Nous pouvons faire évoluer cette politique avec l’application. La date de dernière mise
          à jour figure en haut de cette page.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
