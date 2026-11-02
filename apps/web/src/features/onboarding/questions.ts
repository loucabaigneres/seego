import type { QuizOption, QuizQuestion } from './lib/quiz';

export interface QuestionOption<Q extends QuizQuestion> {
  value: QuizOption<Q>;
  title: string;
  description: string;
}

export interface QuestionCopy<Q extends QuizQuestion> {
  title: string;
  subtitle: string;
  options: readonly QuestionOption<Q>[];
}

export const QUESTIONS: { [Q in QuizQuestion]: QuestionCopy<Q> } = {
  landscapes: {
    title: "Quels décors t'inspirent ?",
    subtitle: 'Choisis un ou plusieurs environnements pour ton séjour.',
    options: [
      {
        value: 'city',
        title: 'Cité vibrante & Histoire',
        description: 'Architecture, ruelles vivantes, musées et effervescence urbaine',
      },
      {
        value: 'coast',
        title: 'Littoral & Grand large',
        description: 'Plages, côtes sauvages, brise marine et couchers de soleil',
      },
      {
        value: 'nature',
        title: 'Montagne & Grands espaces',
        description: 'Sentiers d’altitude, air pur, forêts et panoramas ouverts',
      },
      {
        value: 'countryside',
        title: 'Terroir & Campagne',
        description: 'Villages préservés, vignobles et quiétude',
      },
    ],
  },
  vibes: {
    title: 'Quelles atmosphères recherches-tu ?',
    subtitle: "Sélectionne les types d'expériences souhaitées.",
    options: [
      {
        value: 'culture',
        title: 'Culture & Patrimoine',
        description: 'Monuments historiques, expositions et immersion locale',
      },
      {
        value: 'food',
        title: 'Gastronomie & Terroir',
        description: 'Marchés typiques, spécialités régionales et tables gourmandes',
      },
      {
        value: 'outdoor',
        title: 'Outdoor & Aventure',
        description: 'Randonnées actives, activités de plein air et sensations',
      },
      {
        value: 'relax',
        title: 'Farniente & Déconnexion',
        description: 'Rythme lent, terrasses paisibles et détente au calme',
      },
      {
        value: 'nightlife',
        title: 'Vie nocturne & Sorties',
        description: 'Bars animés, concerts et ambiance festive le soir',
      },
    ],
  },
  travelWith: {
    title: 'Avec qui voyages-tu ?',
    subtitle: 'Précise la dynamique de ton groupe.',
    options: [
      {
        value: 'solo',
        title: 'En solo',
        description: 'Liberté complète et découvertes à ton propre rythme',
      },
      {
        value: 'couple',
        title: 'En couple',
        description: 'Escapade intime et moments privilégiés à deux',
      },
      {
        value: 'friends',
        title: 'Entre potes',
        description: 'Sorties festives, rires et road trip partagé',
      },
      {
        value: 'family',
        title: 'En famille',
        description: 'Activités adaptées pour petits et grands',
      },
    ],
  },
  climates: {
    title: 'Quel climat préfères-tu ?',
    subtitle: 'Dernière étape pour orienter la géographie du voyage.',
    options: [
      {
        value: 'warm',
        title: 'Grand soleil & Chaleur',
        description: 'Chaleur estivale, idéal pour vivre dehors',
      },
      {
        value: 'mild',
        title: 'Douceur tempérée',
        description: 'Températures agréables parfaites pour explorer à pied',
      },
      {
        value: 'cold',
        title: 'Fraîcheur & Hivernal',
        description: 'Air vif, plaids ou paysages de neige',
      },
    ],
  },
};
