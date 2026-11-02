export function HomeHero() {
  return (
    <>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-3.5 py-1.5 text-xs font-bold text-[#FF4D4D]">
        ✨ Ton voyage commence ici
      </span>
      <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1a1a1a]">
        Comment veux-tu trouver <br className="hidden sm:inline" />
        ta prochaine escapade ?
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm sm:text-base text-[#888]">
        Trouve ton prochain séjour sur mesure en quelques swipes ou laisse l'inspiration faire le reste.
      </p>
    </>
  );
}
