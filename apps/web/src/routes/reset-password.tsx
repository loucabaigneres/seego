import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import React, { useState } from 'react'
import { PasswordInput } from '../components/password-input'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token, error: linkError } = Route.useSearch()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setError(null)

    const { error } = await authClient.resetPassword({ newPassword: password, token })

    if (error) {
      setError(error.message ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    navigate({ to: '/login' })
  }

  const invalidLink = !token || linkError

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-8 bg-[#F2EDE8]">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm border border-[#eee]">
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Nouveau mot de passe</h1>

        {invalidLink ? (
          <>
            <p className="mt-4 text-sm text-[#555]">
              Ce lien est invalide ou a expiré. Fais une nouvelle demande de réinitialisation.
            </p>
            <p className="mt-6 text-center text-xs">
              <Link to="/forgot-password" className="font-bold text-[#FF4D4D] hover:underline">
                Refaire une demande
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-[#888]">Choisis un nouveau mot de passe pour ton compte.</p>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-[#FF4D4D] border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#888] mb-1">
                  Nouveau mot de passe
                </label>
                <PasswordInput
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#FF4D4D] py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/25 hover:brightness-105 active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? 'Enregistrement…' : 'Valider'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
