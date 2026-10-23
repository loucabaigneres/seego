import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle: string
  error: string | null
  footer: ReactNode
  children: ReactNode
}

/** Centered card shared by the login and register pages. */
export function AuthCard({ title, subtitle, error, footer, children }: AuthCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-8 bg-[#F2EDE8]">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm border border-[#eee]">
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">{title}</h1>
        <p className="mt-1 text-sm text-[#888]">{subtitle}</p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-[#FF4D4D] border border-red-100">
            {error}
          </div>
        )}

        {children}

        <p className="mt-6 text-center text-xs text-[#888]">{footer}</p>
      </div>
    </div>
  )
}
