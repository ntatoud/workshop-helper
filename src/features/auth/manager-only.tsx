import { authClient } from '@/features/auth/client'

export function ManagerOnly({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession()

  if (!session.data?.user) {
    return null
  }

  return children
}
