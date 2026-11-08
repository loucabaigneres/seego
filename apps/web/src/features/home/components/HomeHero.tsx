export function HomeHero() {
  return (
    <>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent border border-brand/10 px-3.5 py-1.5 text-xs font-bold text-brand">
        ✨ Ton voyage commence ici
      </span>
      <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-display font-normal tracking-tight text-ink">
        Comment veux-tu trouver <br className="hidden sm:inline" />
        ta prochaine escapade ?
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm sm:text-base text-ink-muted">
        Trouve ton prochain séjour sur mesure en quelques swipes ou laisse l'inspiration faire le reste.
      </p>
    </>
  );
}
