import { createFileRoute } from '@tanstack/react-router'
import { PageStepNew } from '@/features/step/manager/page-step-new'

export const Route = createFileRoute(
  '/manager/workshops/$workshopId/steps/new',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()

  return <PageStepNew params={params} />
}
