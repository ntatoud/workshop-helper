import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { orpc } from '@/orpc/client'
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTitle,
  PageLayoutTopbar,
} from '@/layouts/manager/page-layout'
import { Button } from '@/components/ui/button'

export function PageSessionListing() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(
    null,
  )

  const { data: sessions, refetch: refetchSessions } = useQuery(
    orpc.sessions.list.queryOptions(),
  )
  const { data: workshops } = useQuery(orpc.workshops.list.queryOptions())

  const createSession = useMutation(
    orpc.sessions.create.mutationOptions({
      onSuccess: () => {
        refetchSessions()
        setShowCreateDialog(false)
        setSessionName('')
        setSelectedWorkshopId(null)
      },
    }),
  )

  const endSession = useMutation(
    orpc.sessions.end.mutationOptions({
      onSuccess: () => refetchSessions(),
    }),
  )

  const handleCreate = () => {
    if (!selectedWorkshopId) return
    createSession.mutate({
      workshopId: selectedWorkshopId,
      name: sessionName,
    })
  }

  const handleEndSession = (sessionId: string) => {
    if (confirm('Are you sure you want to end this session?')) {
      endSession.mutate({ id: sessionId })
    }
  }

  return (
    <PageLayout>
      <PageLayoutTopbar
        endActions={
          <Button onClick={() => setShowCreateDialog(true)}>New session</Button>
        }
      >
        <PageLayoutTitle>Live Sessions</PageLayoutTitle>
      </PageLayoutTopbar>
      <PageLayoutContent>
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Create Session</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Session Name
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="e.g., Monday Morning Workshop"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Workshop
                  </label>
                  <select
                    value={selectedWorkshopId || ''}
                    onChange={(e) => setSelectedWorkshopId(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">-- Select a workshop --</option>
                    {workshops?.map((workshop) => (
                      <option key={workshop.id} value={workshop.id}>
                        {workshop.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowCreateDialog(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={
                      !sessionName ||
                      !selectedWorkshopId ||
                      createSession.isPending
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createSession.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
