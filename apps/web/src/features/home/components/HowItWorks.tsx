const STEPS = [
  {
    title: 'Tu swipes',
    description: 'Like ou passe. En une dizaine de cartes, Seego comprend ce qui te fait vibrer.',
  },
  {
    title: 'On assemble',
    description: 'Destination, itinéraire jour par jour, hébergements et trajets, calculés pour ton groupe.',
  },
  {
    title: 'Tu pars',
    description: 'Ajuste chaque étape, partage le voyage avec tes amis et réserve quand tu es prêt.',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-t border-line px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-md font-display text-3xl font-normal leading-tight text-ink sm:text-4xl">
          De quelques swipes à un voyage prêt à partir
        </h2>
        <ol className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-5 md:block">
              <span className="font-display text-5xl leading-none text-brand/30">{i + 1}</span>
              <div className="md:mt-4">
                <h3 className="font-display text-xl font-normal text-ink">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-secondary">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
