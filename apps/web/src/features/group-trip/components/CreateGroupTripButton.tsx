import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export function CreateGroupTripButton() {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: createGroup, isPending } = useMutation(
    trpc.group.createOrConvertGroupTrip.mutationOptions({
      onSuccess: (data) => {
        const url = `${window.location.origin}/join/${data.inviteCode}`;
        setInviteLink(url);
      },
    })
  );

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => createGroup({})}
        className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-ink-inverse transition hover:bg-ink active:scale-95 disabled:opacity-50"
      >
        {isPending ? 'Création…' : 'Créer un voyage de groupe'}
      </button>

      {inviteLink && (
        <div className="mt-4 rounded-card border border-brand/15 bg-surface p-4">
          <p className="text-xs font-semibold text-ink">Partage ce lien avec tes amis :</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 rounded-xl border border-line-strong bg-background px-3 py-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl bg-brand px-3 py-2 text-xs font-bold text-accent transition hover:brightness-105"
            >
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
