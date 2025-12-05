import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/orpc/client'

export const Route = createFileRoute('/app/$sessionId/$participantId')({
  component: ParticipantWorkshopPage,
})

function ParticipantWorkshopPage() {
  const { participantId } = Route.useParams()
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set())
  const [expandedSubsteps, setExpandedSubsteps] = useState<Set<number>>(
    new Set(),
  )
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set())
  const [revealedSolutions, setRevealedSolutions] = useState<Set<number>>(
    new Set(),
  )

  const { data: participant } = useQuery(
    orpc.participants.get.queryOptions({
      input: {
        id: parseInt(participantId),
      },
    }),
  )

  const { data: workshopContent } = useQuery(
    orpc.access.getWorkshopWithAccess.queryOptions({
      input: {
        participantId: Number.parseInt(participantId),
        workshopId: participant?.session.workshop.id,
      } as any,
      enabled: !!participant?.session.workshop.id,
    }),
  )

  const toggleStep = (stepId: number) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const toggleSubstep = (substepId: number) => {
    const newExpanded = new Set(expandedSubsteps)
    if (newExpanded.has(substepId)) {
      newExpanded.delete(substepId)
    } else {
      newExpanded.add(substepId)
    }
    setExpandedSubsteps(newExpanded)
  }

  const revealHint = (hintId: number) => {
    setRevealedHints(new Set([...revealedHints, hintId]))
  }

  const revealSolution = (solutionId: number) => {
    setRevealedSolutions(new Set([...revealedSolutions, solutionId]))
  }

  if (!participant || !workshopContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {participant.session.workshop.title}
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {participant.name} · Session:{' '}
                {participant.session.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {workshopContent.steps.length > 0 ? (
          <div className="space-y-6">
            {workshopContent.steps.map((step, stepIndex) => (
              <div key={step.id} className="bg-white rounded-lg shadow">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                      Step {stepIndex + 1}: {step.title}
                    </h2>
                    <span className="text-2xl">
                      {expandedSteps.has(step.id) ? '−' : '+'}
                    </span>
                  </div>
                  {step.description && (
                    <p className="text-gray-600 mt-2">{step.description}</p>
                  )}
                </div>

                {expandedSteps.has(step.id) && (
                  <div className="border-t p-6 bg-gray-50">
                    {step.content && (
                      <div className="prose max-w-none mb-6 bg-white p-4 rounded">
                        <pre className="whitespace-pre-wrap">
                          {step.content}
                        </pre>
                      </div>
                    )}

                    {/* Substeps */}
                    <div className="space-y-4">
                      {step.substeps.map((substep, substepIndex) => (
                        <div
                          key={substep.id}
                          className="border rounded-lg bg-white"
                        >
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleSubstep(substep.id)}
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold">
                                {stepIndex + 1}.{substepIndex + 1}{' '}
                                {substep.title}
                              </h3>
                              <span className="text-xl">
                                {expandedSubsteps.has(substep.id) ? '−' : '+'}
                              </span>
                            </div>
                            {substep.description && (
                              <p className="text-gray-600 text-sm mt-1">
                                {substep.description}
                              </p>
                            )}
                          </div>

                          {expandedSubsteps.has(substep.id) && (
                            <div className="border-t p-4 bg-gray-50">
                              {substep.content && (
                                <div className="prose max-w-none mb-4 bg-white p-4 rounded">
                                  <pre className="whitespace-pre-wrap text-sm">
                                    {substep.content}
                                  </pre>
                                </div>
                              )}

                              {/* Hints */}
                              {substep.hints.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-semibold mb-2">
                                    💡 Hints
                                  </h4>
                                  <div className="space-y-2">
                                    {substep.hints.map((hint, hintIndex) => (
                                      <div key={hint.id}>
                                        {revealedHints.has(hint.id) ? (
                                          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                                            <p className="text-sm font-medium text-yellow-800 mb-1">
                                              Hint {hintIndex + 1}:
                                            </p>
                                            <p className="text-sm">
                                              {hint.content}
                                            </p>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => revealHint(hint.id)}
                                            className="w-full text-left px-3 py-2 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded text-sm"
                                          >
                                            🔒 Click to reveal Hint{' '}
                                            {hintIndex + 1}
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Solutions */}
                              {substep.solutions.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    ✅ Solution
                                  </h4>

                                  <div className="space-y-2">
                                    {substep.solutions.map((solution) => (
                                      <div key={solution.id}>
                                        {revealedSolutions.has(solution.id) ? (
                                          <div className="bg-green-50 border border-green-200 p-4 rounded">
                                            <div className="bg-white p-3 rounded mb-2">
                                              <pre className="whitespace-pre-wrap text-sm font-mono">
                                                {solution.content}
                                              </pre>
                                            </div>
                                            {solution.explanation && (
                                              <div className="text-sm text-green-800">
                                                <strong>Explanation:</strong>
                                                <p className="mt-1">
                                                  {solution.explanation}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() =>
                                              revealSolution(solution.id)
                                            }
                                            className="w-full text-left px-4 py-3 bg-green-100 hover:bg-green-200 border border-green-300 rounded font-semibold"
                                          >
                                            🔒 Click to reveal Solution
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Waiting for Access
            </h2>
            <p className="text-gray-600">
              The workshop manager hasn't granted you access to any content yet.
              <br />
              Please wait while they set up your access.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
