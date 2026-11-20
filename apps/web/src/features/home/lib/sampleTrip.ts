/** A sample itinerary shown on the home page to illustrate what Seego builds. */
export const SAMPLE_TRIP = {
  city: 'Lisbonne',
  country: 'Portugal',
  photo: 'photo-1697748525265-7431cba075b6',
  travelers: 2,
  days: [
    {
      label: 'Jour 1',
      theme: 'Alfama et ses miradouros',
      stops: [
        {
          time: '09:30',
          title: "Balade dans l'Alfama",
          detail: 'Ruelles, Sé et vue depuis Santa Luzia',
        },
        {
          time: '12:30',
          title: 'Déjeuner à Mouraria',
          detail: 'Petiscos dans une tasca de quartier',
        },
        {
          time: '15:00',
          title: "Tram 28 jusqu'à Estrela",
          detail: '25 minutes, assis côté fenêtre',
        },
        { time: '19:30', title: 'Dîner à Bica', detail: 'Puis le funiculaire illuminé' },
      ],
    },
    {
      label: 'Jour 2',
      theme: 'Belém et le bord du Tage',
      stops: [
        {
          time: '10:00',
          title: 'Monastère des Hiéronymites',
          detail: 'Arrive tôt pour éviter la file',
        },
        { time: '12:30', title: 'Pastéis de nata', detail: 'Pause sucrée face au fleuve' },
        { time: '15:00', title: 'LX Factory', detail: 'Librairies, cafés et ateliers' },
        { time: '21:00', title: 'Soirée fado', detail: 'Dans une casa de fado de Alfama' },
      ],
    },
    {
      label: 'Jour 3',
      theme: 'Escapade à Sintra',
      stops: [
        { time: '09:00', title: 'Train pour Sintra', detail: '40 minutes depuis Rossio' },
        { time: '10:30', title: 'Palais de la Pena', detail: 'Billets réservés pour 10 h 30' },
        {
          time: '13:30',
          title: 'Déjeuner dans le centre',
          detail: 'Spécialité locale : les travesseiros',
        },
        {
          time: '17:00',
          title: 'Retour à Lisbonne',
          detail: 'Dernier coucher de soleil sur le Tage',
        },
      ],
    },
  ],
} as const;
