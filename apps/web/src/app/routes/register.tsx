import { createFileRoute } from '@tanstack/react-router'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { authSearchSchema } from '@/features/auth/lib/redirect'

export const Route = createFileRoute('/register')({
  validateSearch: (search) => authSearchSchema.parse(search),
  component: RegisterPage,
})

function RegisterPage() {
  const { redirect } = Route.useSearch()
  return <RegisterForm redirect={redirect} />
}
