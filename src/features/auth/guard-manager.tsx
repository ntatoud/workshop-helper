import { useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Spinner } from '@/components/ui/spinner'

import { authClient } from '@/features/auth/client'

export const GuardManager = ({ children }: { children?: ReactNode }) => {
  const session = authClient.useSession()
  const router = useRouter()

  if (session.isPending) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <Spinner className="opacity-60" />
      </div>
    )
  }

  if (session.error && session.error.status > 0) {
    return <>Error</>
  }

  if (!session.data?.user) {
    router.navigate({
      to: '/login',
      replace: true,
      search: {
        redirect: location.pathname,
      },
    })
    return null
  }

  return <>{children}</>
}
