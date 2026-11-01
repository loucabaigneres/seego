import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { authSearchSchema } from '@/features/auth/lib/redirect'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/login')({
  head: () => seo({ title: 'Connexion', path: '/login', noindex: true }),
  validateSearch: (search) => authSearchSchema.parse(search),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  return <LoginForm redirect={redirect} />
}
