import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LEGAL, ROUTES } from '../../lib/legal';

type LegalLayoutProps = {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
};

/** Shared shell for the legal pages: back link, title, last update date and readable prose. */
export function LegalLayout({ title, intro, children }: LegalLayoutProps) {
  useEffect(() => {
    document.title = `${title} — Seego`;
  }, [title]);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-6 lg:py-16">
      <a
        href={ROUTES.home}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour à l’accueil
      </a>

      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">Dernière mise à jour : {LEGAL.lastUpdated}</p>
      {intro && <div className="mt-6 text-base leading-relaxed text-ink/80">{intro}</div>}

      <div className="mt-10 space-y-10">{children}</div>
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-extrabold tracking-tight text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/80 sm:text-base">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-accent">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function MailLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="font-semibold text-ink underline decoration-accent/50 underline-offset-2 hover:decoration-accent"
    >
      {email}
    </a>
  );
}
