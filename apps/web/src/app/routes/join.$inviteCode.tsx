import { createFileRoute } from '@tanstack/react-router'
import { JoinInvitationCard } from '@/features/group-trip/components/JoinInvitationCard'

export const Route = createFileRoute('/join/$inviteCode')({
  component: JoinGroupPage,
})

function JoinGroupPage() {
  const { inviteCode } = Route.useParams()
  return <JoinInvitationCard inviteCode={inviteCode} />
}
