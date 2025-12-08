import { createFileRoute } from '@tanstack/react-router'

import { PageStep } from '@/features/step/manager/page-step'

export const Route = createFileRoute(
  '/manager/workshops/$workshopId/steps/$stepId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()

  return <PageStep params={params} />
}
