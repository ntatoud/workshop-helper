import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpc } from '@/orpc/client'

export const Route = createFileRoute(
  '/manager/workshops/$workshopId/steps/$stepId/',
)({
  component: StepDetailPage,
})

function StepDetailPage() {
  const { workshopId, stepId } = Route.useParams()
  const navigate = useNavigate()
  const [showSubstepDialog, setShowSubstepDialog] = useState(false)
  const [substepTitle, setSubstepTitle] = useState('')
  const [substepDescription, setSubstepDescription] = useState('')
  const [substepContent, setSubstepContent] = useState('')

  const { data: workshop, refetch } = useQuery(
    orpc.workshops.get.queryOptions({
      input: {
        id: parseInt(workshopId),
      },
    }),
  )

  const createSubstep = useMutation(
    orpc.substeps.create.mutationOptions({
      onSuccess: () => {
        refetch()
        setShowSubstepDialog(false)
        setSubstepTitle('')
        setSubstepDescription('')
        setSubstepContent('')
      },
    }),
  )

  const deleteStep = useMutation(
    orpc.steps.delete.mutationOptions({
      onSuccess: () => {
        navigate({
          to: '/manager/workshops/$workshopId',
          params: { workshopId },
        })
      },
    }),
  )

  const step = workshop?.steps?.find((s) => s.id === parseInt(stepId))

  const handleCreateSubstep = () => {
    if (!step) return
    const nextOrder = (step.substeps?.length || 0) + 1
    createSubstep.mutate({
      stepId: step.id,
      title: substepTitle,
      description: substepDescription,
      content: substepContent,
      order: nextOrder,
    })
  }

  const handleDeleteStep = () => {
    if (confirm('Are you sure you want to delete this step?')) {
      deleteStep.mutate({ id: parseInt(stepId) })
    }
  }

  if (!workshop || !step) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <Link
          to="/manager/workshops/$workshopId"
          params={{ workshopId }}
          className="text-blue-600 hover:underline mb-2 inline-block"
        >
          ← Back to Workshop
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">{step.title}</h1>
            {step.description && (
              <p className="text-gray-600 mt-2">{step.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSubstepDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Substep
            </button>
            <button
              onClick={handleDeleteStep}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Step
            </button>
          </div>
        </div>
      </div>

      {showSubstepDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Substep</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={substepTitle}
                  onChange={(e) => setSubstepTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Substep title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={substepDescription}
                  onChange={(e) => setSubstepDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Substep description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Content
                </label>
                <textarea
                  value={substepContent}
                  onChange={(e) => setSubstepContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Substep content"
                  rows={8}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowSubstepDialog(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubstep}
                  disabled={!substepTitle || createSubstep.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createSubstep.isPending ? 'Creating...' : 'Create Substep'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step.content && (
        <div className="mb-8 prose max-w-none bg-gray-50 p-6 rounded">
          <h3 className="text-lg font-semibold mb-2">Step Content</h3>
          {step.content}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Substeps</h2>
        {step.substeps?.map((substep, index) => (
          <div key={substep.id} className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {index + 1}. {substep.title}
                </h3>
                {substep.description && (
                  <p className="text-gray-600 mt-1">{substep.description}</p>
                )}
              </div>
              <Link
                to="/manager/workshops/$workshopId/steps/$stepId/substeps/$substepId"
                params={{
                  workshopId,
                  stepId,
                  substepId: substep.id.toString(),
                }}
                className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Edit
              </Link>
            </div>
            {substep.content && (
              <div className="prose max-w-none bg-gray-50 p-4 rounded mb-4">
                {substep.content}
              </div>
            )}
            <div className="flex gap-4 text-sm text-gray-500">
              <span>{substep.hints?.length || 0} hints</span>
              <span>{substep.solutions?.length || 0} solutions</span>
            </div>
          </div>
        ))}
      </div>

      {!step.substeps?.length && (
        <div className="text-center py-12 text-gray-500">
          No substeps yet. Add your first substep to get started!
        </div>
      )}
    </div>
  )
}
