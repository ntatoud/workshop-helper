import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { orpc } from '@/orpc/client'
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTitle,
  PageLayoutTopbar,
} from '@/layouts/manager/page-layout'
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button'

export function PageSessionListing() {
  const { data: sessions, refetch: refetchSessions } = useQuery(
    orpc.sessions.list.queryOptions(),
  )

  const endSession = useMutation(
    orpc.sessions.end.mutationOptions({
      onSuccess: () => refetchSessions(),
    }),
  )

  const handleEndSession = (sessionId: string) => {
    if (confirm('Are you sure you want to end this session?')) {
      endSession.mutate({ id: sessionId })
    }
  }

  return (
    <PageLayout>
      <PageLayoutTopbar
        endActions={
          <Link to="/manager/sessions/new">
            <ResponsiveIconButton variant="outline" label="New Session">
              <PlusIcon />
            </ResponsiveIconButton>
          </Link>
        }
      >
        <PageLayoutTitle>Live Sessions</PageLayoutTitle>
      </PageLayoutTopbar>
      <PageLayoutContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions?.map((session) => (
            <div
              key={session.id}
              className={`border rounded-lg p-6 ${
                session.isActive
                  ? 'border-green-500'
                  : 'border-gray-300 opacity-75'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{session.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {session.workshop?.title}
                  </p>
                </div>
                {session.isActive && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    Active
                  </span>
                )}
              </div>

              <div className="bg-gray-100 p-3 rounded mb-4">
                <p className="text-sm text-gray-600 mb-1">Join Code:</p>
                <p className="text-2xl font-bold tracking-wider">
                  {session.code}
                </p>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p>{session.participants?.length || 0} participants</p>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/manager/sessions/$sessionId"
                  params={{ sessionId: session.id.toString() }}
                  className="flex-1 px-3 py-2 text-center bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Manage
                </Link>
                {session.isActive && (
                  <button
                    onClick={() => handleEndSession(session.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    End
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!sessions?.length && (
          <div className="text-center py-12 text-gray-500">
            No sessions yet. Create your first session to get started!
          </div>
        )}
      </PageLayoutContent>
    </PageLayout>
  )
}
