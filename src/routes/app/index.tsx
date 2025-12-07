import { createFileRoute } from '@tanstack/react-router'

import { PageJoinSession } from '@/features/session/page-join-session'

export const Route = createFileRoute('/app/')({
  component: PageJoinSession,
})
