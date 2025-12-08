import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { orpc } from '@/orpc/client'

export function PageSubstep({
  params,
}: {
  params: {
    workshopId: string
    stepId: string
    substepId: string
  }
}) {
  const { workshopId, stepId, substepId } = params

  const navigate = useNavigate()
  const [showHintDialog, setShowHintDialog] = useState(false)
  const [showSolutionDialog, setShowSolutionDialog] = useState(false)
  const [hintContent, setHintContent] = useState('')
  const [solutionContent, setSolutionContent] = useState('')
  const [solutionExplanation, setSolutionExplanation] = useState('')

  const { data: workshop, refetch } = useQuery(
    orpc.workshops.get.queryOptions({
      input: {
        id: workshopId,
      },
    }),
  )

  const createHint = useMutation(
    orpc.hints.create.mutationOptions({
      onSuccess: () => {
        refetch()
        setShowHintDialog(false)
        setHintContent('')
      },
    }),
  )

  const createSolution = useMutation(
    orpc.solutions.create.mutationOptions({
      onSuccess: () => {
        refetch()
        setShowSolutionDialog(false)
        setSolutionContent('')
        setSolutionExplanation('')
      },
    }),
  )

  const deleteHint = useMutation(
    orpc.hints.delete.mutationOptions({
      onSuccess: () => refetch(),
    }),
  )
  const deleteSolution = useMutation(
    orpc.solutions.delete.mutationOptions({
      onSuccess: () => refetch(),
    }),
  )
  const deleteSubstep = useMutation(
    orpc.substeps.delete.mutationOptions({
      onSuccess: () => {
        navigate({
          to: '/manager/workshops/$workshopId/steps/$stepId',
          params: { workshopId, stepId },
        })
      },
    }),
  )

  const step = workshop?.steps?.find((s) => s.id === stepId)
  const substep = step?.substeps?.find((ss) => ss.id === substepId)

  const handleCreateHint = () => {
    if (!substep) return
    const nextOrder = (substep.hints?.length || 0) + 1
    createHint.mutate({
      substepId: substep.id,
      content: hintContent,
      order: nextOrder,
    })
  }

  const handleCreateSolution = () => {
    if (!substep) return
    createSolution.mutate({
      substepId: substep.id,
      content: solutionContent,
      explanation: solutionExplanation,
    })
  }

  const handleDeleteSubstep = () => {
    if (confirm('Are you sure you want to delete this substep?')) {
      deleteSubstep.mutate({ id: substepId })
    }
  }

  const handleDeleteHint = (hintId: string) => {
    if (confirm('Are you sure you want to delete this hint?')) {
      deleteHint.mutate({ id: hintId })
    }
  }

  const handleDeleteSolution = (solutionId: string) => {
    if (confirm('Are you sure you want to delete this solution?')) {
      deleteSolution.mutate({ id: solutionId })
    }
  }

  if (!workshop || !step || !substep) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <Link
          to="/manager/workshops/$workshopId/steps/$stepId"
          params={{ workshopId, stepId }}
          className="text-blue-600 hover:underline mb-2 inline-block"
        >
          ← Back to Step
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">{substep.title}</h1>
            {substep.description && (
              <p className="text-gray-600 mt-2">{substep.description}</p>
            )}
          </div>
          <button
            onClick={handleDeleteSubstep}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Substep
          </button>
        </div>
      </div>

      {showHintDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Add Hint</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hint Content
                </label>
                <textarea
                  value={hintContent}
                  onChange={(e) => setHintContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter hint content"
                  rows={6}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowHintDialog(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateHint}
                  disabled={!hintContent || createHint.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createHint.isPending ? 'Adding...' : 'Add Hint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSolutionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Solution</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Solution Content
                </label>
                <textarea
                  value={solutionContent}
                  onChange={(e) => setSolutionContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter solution content"
                  rows={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Explanation (optional)
                </label>
                <textarea
                  value={solutionExplanation}
                  onChange={(e) => setSolutionExplanation(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter explanation"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowSolutionDialog(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSolution}
                  disabled={!solutionContent || createSolution.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createSolution.isPending ? 'Adding...' : 'Add Solution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {substep.content && (
        <div className="mb-8 prose max-w-none bg-gray-50 p-6 rounded">
          <h3 className="text-lg font-semibold mb-2">Substep Content</h3>
          {substep.content}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Hints</h2>
            <button
              onClick={() => setShowHintDialog(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Hint
            </button>
          </div>
          <div className="space-y-4">
            {substep.hints?.map((hint, index) => (
              <div key={hint.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-gray-500">
                    Hint {index + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteHint(hint.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="whitespace-pre-wrap">{hint.content}</p>
              </div>
            ))}
            {!substep.hints?.length && (
              <p className="text-gray-500 text-center py-8">No hints yet</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Solutions</h2>
            <button
              onClick={() => setShowSolutionDialog(true)}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Solution
            </button>
          </div>
          <div className="space-y-4">
            {substep.solutions?.map((solution) => (
              <div key={solution.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-green-600">
                    Solution
                  </span>
                  <button
                    onClick={() => handleDeleteSolution(solution.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <div className="prose max-w-none bg-green-50 p-3 rounded mb-2">
                  <pre className="whitespace-pre-wrap text-sm">
                    {solution.content}
                  </pre>
                </div>
                {solution.explanation && (
                  <div className="text-sm text-gray-600">
                    <strong>Explanation:</strong>
                    <p className="mt-1">{solution.explanation}</p>
                  </div>
                )}
              </div>
            ))}
            {!substep.solutions?.length && (
              <p className="text-gray-500 text-center py-8">No solutions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
