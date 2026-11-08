import { useState } from 'react';
import { FIELD_CLASS, LABEL_CLASS } from '@/components/formStyles';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

export function ProfileSettingsForm({ initialName }: { initialName: string }) {
  const [nameInput, setNameInput] = useState<string | null>(null);
  const { updateName, isSaving, updateSuccess } = useUpdateProfile();
  const currentName = nameInput ?? initialName;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = currentName.trim();
    if (!finalName) return;
    updateName(finalName);
  };

  return (
    <form
      onSubmit={handleSaveProfile}
      className="space-y-6 rounded-card bg-surface p-6 sm:p-8 border border-brand/15"
    >
      <div>
        <label htmlFor="profileName" className={LABEL_CLASS}>
          Nom d'affichage
        </label>
        <input
          id="profileName"
          type="text"
          value={currentName}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Votre nom"
          className={FIELD_CLASS}
        />
      </div>

      {updateSuccess && (
        <div className="rounded-xl bg-success/10 p-3 text-center text-xs font-semibold text-success-text">
          ✓ Profil mis à jour avec succès !
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-accent shadow-lg shadow-brand/25 hover:brightness-105 active:scale-95 disabled:opacity-50 transition cursor-pointer"
      >
        {isSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
      </button>
    </form>
  );
}
