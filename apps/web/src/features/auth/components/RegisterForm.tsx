import { Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useAuthSubmit } from '../hooks/useAuthSubmit'
import { AuthCard } from './AuthCard'
import { AuthField } from './AuthField'
import { SubmitButton } from './SubmitButton'

export function RegisterForm({ redirect }: { redirect: string | undefined }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { submit, error, loading } = useAuthSubmit(redirect)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit((fetchOptions) => authClient.signUp.email({ name, email, password, fetchOptions }))
  }

  return (
    <AuthCard
      title="Inscription"
      subtitle="Crée un compte pour sauvegarder tes itinéraires."
      error={error}
      footer={
        <>
          Déjà un compte ?{' '}
          <Link
            to="/login"
            search={{ redirect }}
            className="font-bold text-[#FF4D4D] hover:underline"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} className="mt-6 space-y-4">
        <AuthField label="Nom complet" type="text" value={name} onChange={setName} />
        <AuthField label="Email" type="email" value={email} onChange={setEmail} />
        <AuthField label="Mot de passe" type="password" value={password} onChange={setPassword} />
        <SubmitButton loading={loading} label="Créer mon compte" loadingLabel="Création en cours…" />
      </form>
    </AuthCard>
  )
}
