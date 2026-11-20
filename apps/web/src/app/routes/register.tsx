import { createFileRoute } from '@tanstack/react-router'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { authSearchSchema } from '@/features/auth/lib/redirect'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/register')({
  head: () => seo({ title: 'Créer un compte', path: '/register' }),
  validateSearch: (search) => authSearchSchema.parse(search),
  component: RegisterPage,
})

function RegisterPage() {
  const { redirect } = Route.useSearch()
  return <RegisterForm redirect={redirect} />
}
