import { createFileRoute } from '@tanstack/react-router'
import { JoinInvitationCard } from '@/features/group-trip/components/JoinInvitationCard'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/join/$inviteCode')({
  head: () => seo({ title: 'Rejoindre un voyage', path: '/join', noindex: true }),
  component: JoinGroupPage,
})

function JoinGroupPage() {
  const { inviteCode } = Route.useParams()
  return <JoinInvitationCard inviteCode={inviteCode} />
}
