import { useState } from 'react';
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
      className="space-y-6 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-[#eee]"
    >
      <div>
        <label htmlFor="profileName" className="block text-sm font-medium text-[#1a1a1a] mb-2">
          Nom d'affichage
        </label>
        <input
          id="profileName"
          type="text"
          value={currentName}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Votre nom"
          className="w-full border border-[#ddd] p-3 rounded-xl bg-white focus:border-[#FF4D4D] focus:ring-2 focus:ring-[#FF4D4D]/20 outline-none transition text-[#1a1a1a]"
        />
      </div>

      {updateSuccess && (
        <div className="rounded-xl bg-[#e8f8f0] p-3 text-center text-xs font-semibold text-[#2ecc71]">
          ✓ Profil mis à jour avec succès !
        </div>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-2xl bg-[#FF4D4D] py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/25 hover:brightness-105 active:scale-95 disabled:opacity-50 transition cursor-pointer"
      >
        {isSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
      </button>
    </form>
  );
}
