import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageSpinner } from '@/components/PageSpinner';
import { ImportInspirationForm } from '@/features/inspiration/components/ImportInspirationForm';
import { InspirationList } from '@/features/inspiration/components/InspirationList';
import { useRequireSession } from '@/hooks/useRequireSession';
import { seo } from '@/lib/seo';
import { trpc } from '@/lib/trpc';

export const Route = createFileRoute('/importVideo')({
  head: () => seo({ title: 'Importer une vidéo', path: '/importVideo' }),
  component: ImportVideoPage,
});

function ImportVideoPage() {
  const queryClient = useQueryClient();
  const { session, isPending: isSessionLoading } = useRequireSession();

  if (isSessionLoading || !session?.user) {
    return <PageSpinner label="Chargement…" />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-display font-normal text-ink">Importer une inspiration</h1>
      <p className="mt-1 text-sm font-medium text-ink-muted">
        Colle le lien d'un reel, d'une vidéo ou d'un post : notre IA en fait un compte rendu et
        repère les lieux (avec leur adresse) pour nourrir tes futurs voyages.
      </p>

      <div className="mt-6">
        <ImportInspirationForm
          onSuccess={() => queryClient.invalidateQueries(trpc.inspiration.listMine.queryFilter())}
        />
      </div>

      <h2 className="mt-10 text-lg font-display font-normal text-ink">Mes imports récents</h2>
      <div className="mt-4">
        <InspirationList />
      </div>
    </div>
  );
}
