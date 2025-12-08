import { createFileRoute } from '@tanstack/react-router'
import { PageDashboard } from '@/features/dashboard/manager/page-dashboard'

export const Route = createFileRoute('/manager/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageDashboard />
}
