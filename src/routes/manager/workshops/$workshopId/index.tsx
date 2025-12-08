import { createFileRoute } from '@tanstack/react-router'

import { PageWorkshop } from '@/features/workshop/manager/page-workshop'

export const Route = createFileRoute('/manager/workshops/$workshopId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()

  return <PageWorkshop params={params} />
}
