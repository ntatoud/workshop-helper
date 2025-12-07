import { Outlet, createFileRoute } from '@tanstack/react-router'
import { GuardManager } from '@/features/auth/guard-manager'

export const Route = createFileRoute('/manager')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <GuardManager>
      <Outlet />
    </GuardManager>
  )
}
