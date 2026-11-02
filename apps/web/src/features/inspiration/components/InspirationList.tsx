import { trpc } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useInspirationMutations } from '../hooks/useInspirationMutations';
import { toggleInSet } from '../lib/inspiration';
import { AddedToTripBanner } from './AddedToTripBanner';
import { ConfirmDialog } from './ConfirmDialog';
import { InspirationCard } from './InspirationCard';
import { InspirationTypeFilter } from './InspirationTypeFilter';
import { SelectionBar } from './SelectionBar';

interface InspirationListProps {
  enabled?: boolean;
  emptyAction?: ReactNode;
  className?: string;
}

export function InspirationList({
  enabled = true,
  emptyAction,
  className = '',
}: InspirationListProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tripId, setTripId] = useState('');
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [addedTo, setAddedTo] = useState<{ tripId: string; count: number } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const importsQuery = useQuery({ ...trpc.inspiration.listMine.queryOptions(), enabled });
  const tripsQuery = useQuery({ ...trpc.user.getTrips.queryOptions(), enabled });

  const { addToTrip: addToTripMutation, remove: deleteMutation } = useInspirationMutations({
    onAddedToTrip: (data) => {
      setAddedTo({ tripId: data.tripId, count: data.added });
      setSelected(new Set());
    },
    onDeleted: () => setConfirmDeleteId(null),
  });

  const trips = (tripsQuery.data ?? []).map((t) => ({
    id: t.id,
    label: t.title || t.destination || 'Voyage sans titre',
  }));
  const effectiveTripId = tripId || trips[0]?.id || '';

  const all = importsQuery.data ?? [];
  // Aucun type coché = on affiche tout ; sinon on garde les publications du/des types choisis.
  const visible =
    typeFilter.size === 0 ? all : all.filter((i) => i.type !== null && typeFilter.has(i.type));

  const toggleSelected = (id: string) => {
    setAddedTo(null);
    setSelected((prev) => toggleInSet(prev, id));
  };

  const confirmDelete = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    deleteMutation.mutate({ id });
  };

  if (importsQuery.isLoading) {
    return (
      <p className="p-6 text-center text-sm font-medium text-[#888]">Chargement de tes imports…</p>
    );
  }

  if (all.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#ddd] bg-white p-10 text-center shadow-sm">
        <span className="text-4xl">✨</span>
        <p className="text-sm font-semibold text-[#1a1a1a]">
          Tu n'as pas encore importé d'inspiration.
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <InspirationTypeFilter
        selected={typeFilter}
        onToggle={(value) => setTypeFilter((prev) => toggleInSet(prev, value))}
        onClear={() => setTypeFilter(new Set())}
      />

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#ddd] bg-white p-6 text-center text-sm text-[#888]">
          Aucune publication de ce type.
        </p>
      ) : (
        visible.map((item) => (
          <InspirationCard
            key={item.id}
            item={item}
            isSelected={selected.has(item.id)}
            onToggle={() => toggleSelected(item.id)}
            onDelete={() => setConfirmDeleteId(item.id)}
          />
        ))
      )}

      {addedTo && <AddedToTripBanner tripId={addedTo.tripId} count={addedTo.count} />}

      {selected.size > 0 && (
        <SelectionBar
          count={selected.size}
          trips={trips}
          tripId={effectiveTripId}
          isAdding={addToTripMutation.isPending}
          onTripChange={setTripId}
          onClear={() => setSelected(new Set())}
          onAdd={() =>
            addToTripMutation.mutate({ tripId: effectiveTripId, inspirationIds: [...selected] })
          }
        />
      )}

      {(addToTripMutation.isError || deleteMutation.isError) && (
        <p className="text-center text-xs font-medium text-[#FF4D4D]">
          Une action a échoué, réessaie.
        </p>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Supprimer la publication ?"
          message="Cette publication analysée sera retirée de ta liste. Les lieux déjà ajoutés à tes voyages sont conservés."
          loading={deleteMutation.isPending}
          onConfirm={() => confirmDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
