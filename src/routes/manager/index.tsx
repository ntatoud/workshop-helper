import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/manager/')({
  component: RouteComponent,
  beforeLoad: () => {
    throw redirect({ to: '/manager/workshops' })
  },
})

function RouteComponent() {
  return null
}
