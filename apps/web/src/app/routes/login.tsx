import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { authSearchSchema } from '@/features/auth/lib/redirect'

export const Route = createFileRoute('/login')({
  validateSearch: (search) => authSearchSchema.parse(search),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  return <LoginForm redirect={redirect} />
}
