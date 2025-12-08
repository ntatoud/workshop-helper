import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { orpc } from '@/orpc/client'
import { WorkshopEditor } from '@/components/workshop-editor'
import { WorkshopViewer } from '@/components/workshop-viewer'
import { MarkdownRenderer } from '@/components/markdown-render'
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTitle,
  PageLayoutTopbar,
} from '@/layouts/manager/page-layout'
import { Button } from '@/components/ui/button'

export function PageStep({
  params,
}: {
  params: {
    workshopId: string
    stepId: string
  }
}) {
  const { workshopId, stepId } = params
  const navigate = useNavigate()
  const [showSubstepDialog, setShowSubstepDialog] = useState(false)
  const [substepTitle, setSubstepTitle] = useState('')
  const [substepDescription, setSubstepDescription] = useState('')
  const [substepContent, setSubstepContent] = useState('')

  const { data: workshop, refetch } = useQuery(
    orpc.workshops.get.queryOptions({
      input: {
        id: workshopId,
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

  const step = workshop?.steps?.find((s) => s.id === stepId)

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
      deleteStep.mutate({ id: stepId })
    }
  }

  if (!workshop || !step) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  return (
    <PageLayout>
      <PageLayoutTopbar
        startActions={
          <Button
            asChild
            variant="ghost"
            title="Retour au workshop"
            size="icon"
          >
            <Link to="/manager/workshops/$workshopId" params={{ workshopId }}>
              <ArrowLeft />
            </Link>
          </Button>
        }
        endActions={
          <>
            <Button onClick={() => setShowSubstepDialog(true)}>
              Add Substep
            </Button>
            <Button onClick={handleDeleteStep} variant="destructive">
              Delete Step
            </Button>
          </>
        }
      >
        <PageLayoutTitle>Etape : {step.title}</PageLayoutTitle>
      </PageLayoutTopbar>
      <PageLayoutContent>
        {step.description && (
          <div className="prose max-w-none p-4 pt-2">{step.description}</div>
        )}

        {showSubstepDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Create Substep</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
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
                  <WorkshopEditor />
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

        <WorkshopViewer
          content={[
            {
              children: [
                {
                  text: 'Title',
                },
              ],
              type: 'h1',
              id: 'HkWTSmSs8K',
            },
            {
              type: 'h2',
              id: 'KKVpflkern',
              children: [
                {
                  text: 'subtitle',
                },
              ],
            },
          ]}
        />

        {step.content && (
          <div className="mb-8 prose max-w-none bg-gray-50 p-6 rounded">
            <h3 className="text-lg font-semibold mb-2">Step Content</h3>
            <MarkdownRenderer content={step.content} />
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
                    substepId: substep.id,
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                >
                  Edit
                </Link>
              </div>
              {substep.content && (
                <MarkdownRenderer content={substep.content} />
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
      </PageLayoutContent>
    </PageLayout>
  )
}
