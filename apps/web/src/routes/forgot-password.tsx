import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    setSent(true)
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-8 bg-[#F2EDE8]">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm border border-[#eee]">
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Mot de passe oublié</h1>

        {sent ? (
          <p className="mt-4 text-sm text-[#555]">
            Si un compte existe avec cette adresse, tu vas recevoir un email avec un lien pour
            choisir un nouveau mot de passe.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-[#888]">
              Indique ton adresse email, on t'envoie un lien de réinitialisation.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#888] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#ddd] p-3 rounded-xl bg-white focus:border-[#FF4D4D] focus:ring-2 focus:ring-[#FF4D4D]/20 outline-none transition text-[#1a1a1a]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#FF4D4D] py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/25 hover:brightness-105 active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-xs text-[#888]">
          <Link to="/login" className="font-bold text-[#FF4D4D] hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
