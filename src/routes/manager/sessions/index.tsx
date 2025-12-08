import { createFileRoute } from '@tanstack/react-router'

import { PageSessionListing } from '@/features/session/manager/page-session-listing'

export const Route = createFileRoute('/manager/sessions/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageSessionListing />
}
