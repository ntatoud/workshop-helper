import { createFileRoute } from '@tanstack/react-router'

import { PageSession } from '@/features/session/manager/page-session'

export const Route = createFileRoute('/manager/sessions/$sessionId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  return <PageSession params={params} />
}
