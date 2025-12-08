import { createFileRoute } from '@tanstack/react-router'

import { PageWorkshopListing } from '@/features/workshop/manager/page-workshop-listing'

export const Route = createFileRoute('/manager/workshops/')({
  component: RouteComponent,
})

export function RouteComponent() {
  return <PageWorkshopListing />
}
