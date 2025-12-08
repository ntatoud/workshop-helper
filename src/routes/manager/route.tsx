import { Outlet, createFileRoute } from '@tanstack/react-router'
import { GuardManager } from '@/features/auth/guard-manager'
import { Layout } from '@/layouts/manager/layout'

export const Route = createFileRoute('/manager')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <GuardManager>
      <Layout>
        <Outlet />
      </Layout>
    </GuardManager>
  )
}
