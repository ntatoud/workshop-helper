import { createFileRoute } from '@tanstack/react-router'
import { PageWorkshopNew } from '@/features/workshop/manager/page-workshop-new'

export const Route = createFileRoute('/manager/workshops/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageWorkshopNew />
}
