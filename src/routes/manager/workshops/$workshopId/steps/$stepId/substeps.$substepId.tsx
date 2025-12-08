import { createFileRoute } from '@tanstack/react-router'

import { PageSubstep } from '@/features/substep/manager/page-substep'

export const Route = createFileRoute(
  '/manager/workshops/$workshopId/steps/$stepId/substeps/$substepId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()

  return <PageSubstep params={params} />
}
