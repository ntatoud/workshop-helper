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

export function PageWorkshopListing() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const { data: workshops, refetch } = useQuery(
    orpc.workshops.list.queryOptions(),
  )
  const createWorkshop = useMutation(
    orpc.workshops.create.mutationOptions({
      onSuccess: () => {
        refetch()
        setShowCreateDialog(false)
        setTitle('')
        setDescription('')
      },
    }),
  )

  const handleCreate = () => {
    createWorkshop.mutate({ title, description })
  }

  return (
    <PageLayout>
      <PageLayoutTopbar
        endActions={
          <Button onClick={() => setShowCreateDialog(true)}>
            New Workshop
          </Button>
        }
      >
        <PageLayoutTitle>Workshops</PageLayoutTitle>
      </PageLayoutTopbar>
      <PageLayoutContent>
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Create Workshop</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Workshop title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Workshop description"
                    rows={4}
                  />
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
                    disabled={!title || createWorkshop.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createWorkshop.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops?.map((workshop) => (
            <Link
              key={workshop.id}
              to="/manager/workshops/$workshopId"
              params={{ workshopId: workshop.id }}
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{workshop.title}</h3>
              {workshop.description && (
                <p className="text-gray-600 line-clamp-3">
                  {workshop.description}
                </p>
              )}
              <div className="mt-4 text-sm text-gray-500">
                {workshop.steps?.length || 0} steps
              </div>
            </Link>
          ))}
        </div>

        {!workshops?.length && (
          <div className="text-center py-12 text-gray-500">
            No workshops yet. Create your first workshop to get started!
          </div>
        )}
      </PageLayoutContent>
    </PageLayout>
  )
}
