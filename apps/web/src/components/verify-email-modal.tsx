import React, { useEffect, useRef, useState } from 'react'
import { authClient } from '../lib/auth-client'

const LENGTH = 6
const empty = () => Array<string>(LENGTH).fill('')

type Props = {
  email: string
  onVerified: () => void | Promise<void>
  onClose: () => void
}

export function VerifyEmailModal({ email, onVerified, onClose }: Props) {
  const [digits, setDigits] = useState<string[]>(empty)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(30)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const verify = async (code: string) => {
    setLoading(true)
    setError(null)
    setInfo(null)

    const { error } = await authClient.emailOtp.verifyEmail({ email, otp: code })

    if (error) {
      setError(
        error.code === 'TOO_MANY_ATTEMPTS'
          ? 'Trop de tentatives. Demande un nouveau code.'
          : 'Code invalide ou expiré.'
      )
      setDigits(empty())
      setLoading(false)
      inputs.current[0]?.focus()
      return
    }

    await onVerified()
    setLoading(false)
  }

  // Remplit les cases depuis un code complet (collage ou saisie automatique du téléphone)
  const fill = (raw: string) => {
    const code = raw.replace(/\D/g, '').slice(0, LENGTH)
    if (!code) return
    setDigits(empty().map((_, i) => code[i] ?? ''))
    inputs.current[Math.min(code.length, LENGTH - 1)]?.focus()
    if (code.length === LENGTH) void verify(code)
  }

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '')
    if (clean.length >= LENGTH) {
      fill(clean)
      return
    }
    const next = [...digits]
    next[index] = clean.slice(-1)
    setDigits(next)
    if (next[index] && index < LENGTH - 1) inputs.current[index + 1]?.focus()
    if (next.every(Boolean)) void verify(next.join(''))
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handleResend = async () => {
    setError(null)
    setInfo(null)
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: 'email-verification',
    })
    if (error) {
      setError("Impossible d'envoyer le code. Réessaie dans un instant.")
      return
    }
    setInfo('Un nouveau code vient de t’être envoyé.')
    setCooldown(30)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#eee] bg-white p-8 shadow-xl">
        <h2 id="verify-title" className="text-2xl font-extrabold text-[#1a1a1a]">
          Vérifie ton email
        </h2>
        <p className="mt-1 text-sm text-[#888]">
          Entre le code à 6 chiffres envoyé à{' '}
          <span className="font-semibold text-[#1a1a1a]">{email}</span>.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-[#FF4D4D]">
            {error}
          </div>
        )}
        {info && (
          <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-3 text-xs font-semibold text-green-700">
            {info}
          </div>
        )}

        <div
          className="mt-6 flex justify-between gap-2"
          onPaste={(e) => {
            e.preventDefault()
            fill(e.clipboardData.getData('text'))
          }}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              value={digit}
              disabled={loading}
              aria-label={`Chiffre ${i + 1}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-12 rounded-xl border border-[#ddd] bg-white text-center text-xl font-bold text-[#1a1a1a] outline-none transition focus:border-[#FF4D4D] focus:ring-2 focus:ring-[#FF4D4D]/20 disabled:opacity-50"
            />
          ))}
        </div>

        <p className="mt-4 text-xs text-[#888]">
          Pas reçu ? Regarde dans tes spams. Si tu as déjà un compte, connecte-toi.
        </p>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#888] hover:underline cursor-pointer"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || loading}
            className="text-xs font-bold text-[#FF4D4D] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : 'Renvoyer le code'}
          </button>
        </div>
      </div>
    </div>
  )
}
