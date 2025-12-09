import { createFileRoute } from '@tanstack/react-router'
import { PageSessionNew } from '@/features/session/manager/page-session-new'

export const Route = createFileRoute('/manager/sessions/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageSessionNew />
}
