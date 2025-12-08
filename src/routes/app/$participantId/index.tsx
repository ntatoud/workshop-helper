import { createFileRoute } from '@tanstack/react-router'
import { PageSession } from '@/features/session/page-session'

export const Route = createFileRoute('/app/$participantId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()

  return <PageSession params={params} />
}
