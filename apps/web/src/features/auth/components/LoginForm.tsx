import { Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useAuthSubmit } from '../hooks/useAuthSubmit'
import { AuthCard } from './AuthCard'
import { AuthField } from './AuthField'
import { SubmitButton } from './SubmitButton'

export function LoginForm({ redirect }: { redirect: string | undefined }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { submit, error, loading } = useAuthSubmit(redirect)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit((fetchOptions) => authClient.signIn.email({ email, password, fetchOptions }))
  }

  return (
    <AuthCard
      title="Connexion"
      subtitle="Connecte-toi pour retrouver et enregistrer tes voyages."
      error={error}
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            search={{ redirect }}
            className="font-bold text-[#FF4D4D] hover:underline"
          >
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <AuthField label="Email" type="email" value={email} onChange={setEmail} />
        <AuthField label="Mot de passe" type="password" value={password} onChange={setPassword} />
        <SubmitButton loading={loading} label="Se connecter" loadingLabel="Connexion en cours…" />
      </form>
    </AuthCard>
  )
}
