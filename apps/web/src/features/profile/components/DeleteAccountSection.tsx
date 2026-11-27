import { useState } from 'react';
import { FIELD_CLASS, LABEL_CLASS } from '@/components/formStyles';
import { DELETE_CONFIRMATION, isDeleteConfirmed, useDeleteAccount } from '../hooks/useDeleteAccount';

const ERASED = [
  'ton profil et tes informations de connexion',
  'tes voyages, avec leurs jours et activités',
  'tes lieux likés et tes inspirations importées',
];

/** "Delete my account" block of the settings tab: warning, typed confirmation, then deletion. */
export function DeleteAccountSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const { deleteAccount, isDeleting, needsReauth, error, reauthenticate } = useDeleteAccount();

  if (!isOpen) {
    return (
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-sm font-semibold text-brand hover:underline cursor-pointer"
        >
          Supprimer mon compte
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (needsReauth) {
      void reauthenticate();
      return;
    }
    if (isDeleteConfirmed(typed)) deleteAccount();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5 rounded-card bg-surface p-6 sm:p-8 border border-brand/30"
    >
      <div className="space-y-3 text-sm text-ink">
        <h2 className="text-lg font-display text-ink">Supprimer mon compte</h2>
        <p>La suppression est définitive. Seront effacés :</p>
        <ul className="list-disc space-y-1 pl-5 text-ink-muted">
          {ERASED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-ink-muted">
          Les voyages de groupe que tu as créés restent aux autres membres : le plus ancien en
          devient l'organisateur.
        </p>
      </div>

      <div>
        <label htmlFor="deleteConfirmation" className={LABEL_CLASS}>
          Tape {DELETE_CONFIRMATION} pour confirmer
        </label>
        <input
          id="deleteConfirmation"
          type="text"
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={isDeleting}
          className={FIELD_CLASS}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-surface p-3 text-xs font-semibold text-brand border border-brand/20"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <button
          type="submit"
          disabled={isDeleting || (!needsReauth && !isDeleteConfirmed(typed))}
          className="flex-1 rounded-2xl bg-brand py-3.5 text-sm font-bold text-accent hover:brightness-105 active:scale-95 disabled:opacity-50 transition cursor-pointer"
        >
          {needsReauth
            ? 'Me reconnecter'
            : isDeleting
              ? 'Suppression…'
              : 'Supprimer définitivement mon compte'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setTyped('');
          }}
          disabled={isDeleting}
          className="flex-1 rounded-2xl border border-brand/30 py-3.5 text-sm font-bold text-brand hover:bg-brand/5 disabled:opacity-50 transition cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
