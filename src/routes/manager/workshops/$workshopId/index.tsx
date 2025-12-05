import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpc } from '@/orpc/client'

export const Route = createFileRoute('/manager/workshops/$workshopId/')({
  component: WorkshopDetailPage,
})

function WorkshopDetailPage() {
  const { workshopId } = Route.useParams()
  const navigate = useNavigate()
  const [showStepDialog, setShowStepDialog] = useState(false)
  const [stepTitle, setStepTitle] = useState('')
  const [stepDescription, setStepDescription] = useState('')
  const [stepContent, setStepContent] = useState('')

  const { data: workshop, refetch } = useQuery(
    orpc.workshops.get.queryOptions({
      input: {
        id: parseInt(workshopId),
      },
    }),
  )

  const createStep = useMutation(
    orpc.steps.create.mutationOptions({
      onSuccess: () => {
        refetch()
        setShowStepDialog(false)
        setStepTitle('')
        setStepDescription('')
        setStepContent('')
      },
    }),
  )

  const deleteWorkshop = useMutation(
    orpc.workshops.delete.mutationOptions({
      onSuccess: () => {
        navigate({ to: '/manager/workshops' })
      },
    }),
  )

  const handleCreateStep = () => {
    if (!workshop) return
    const nextOrder = (workshop.steps.length || 0) + 1
    createStep.mutate({
      workshopId: workshop.id,
      title: stepTitle,
      description: stepDescription,
      content: stepContent,
      order: nextOrder,
    })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this workshop?')) {
      deleteWorkshop.mutate({ id: parseInt(workshopId) })
    }
  }

  if (!workshop) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Link
            to="/manager/workshops"
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Workshops
          </Link>
          <h1 className="text-4xl font-bold">{workshop.title}</h1>
          {workshop.description && (
            <p className="text-gray-600 mt-2">{workshop.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStepDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Step
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Workshop
          </button>
        </div>
      </div>

      {showStepDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Step</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Step title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={stepDescription}
                  onChange={(e) => setStepDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Step description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Content
                </label>
                <textarea
                  value={stepContent}
                  onChange={(e) => setStepContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Step content"
                  rows={8}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowStepDialog(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStep}
                  disabled={!stepTitle || createStep.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createStep.isPending ? 'Creating...' : 'Create Step'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {workshop.steps.map((step, index) => (
          <div key={step.id} className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-semibold">
                  Step {index + 1}: {step.title}
                </h3>
                {step.description && (
                  <p className="text-gray-600 mt-1">{step.description}</p>
                )}
              </div>
              <Link
                to="/manager/workshops/$workshopId/steps/$stepId"
                params={{
                  workshopId: workshop.id.toString(),
                  stepId: step.id.toString(),
                }}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Edit
              </Link>
            </div>
            {step.content && (
              <div className="prose max-w-none bg-gray-50 p-4 rounded">
                {step.content}
              </div>
            )}
            <div className="mt-4 text-sm text-gray-500">
              {step.substeps.length || 0} substeps
            </div>
          </div>
        ))}
      </div>

      {!workshop.steps.length && (
        <div className="text-center py-12 text-gray-500">
          No steps yet. Add your first step to get started!
        </div>
      )}
    </div>
  )
}
