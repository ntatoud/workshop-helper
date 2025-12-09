import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { orpc } from '@/orpc/client'
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTitle,
  PageLayoutTopbar,
} from '@/layouts/manager/page-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function PageSession({
  params,
}: {
  params: {
    sessionId: string
  }
}) {
  const { sessionId } = params
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null)
  const [bulkMode, setBulkMode] = useState(false)

  const { data: session, refetch } = useQuery(
    orpc.sessions.get.queryOptions({
      input: {
        id: sessionId,
      },
    }),
  )

  const { data: participantAccess, refetch: refetchAccess } = useQuery(
    orpc.access.getParticipantAccess.queryOptions({
      input: {
        participantId: selectedParticipantId ?? '',
      },
      enabled: !!selectedParticipantId,
    }),
  )

  // Individual participant mutations
  const setStepAccess = useMutation(
    orpc.access.setStepAccess.mutationOptions({
      onSuccess: () => refetchAccess(),
    }),
  )

  const setSubstepAccess = useMutation(
    orpc.access.setSubstepAccess.mutationOptions({
      onSuccess: () => refetchAccess(),
    }),
  )

  const setHintAccess = useMutation(
    orpc.access.setHintAccess.mutationOptions({
      onSuccess: () => refetchAccess(),
    }),
  )

  const setSolutionAccess = useMutation(
    orpc.access.setSolutionAccess.mutationOptions({
      onSuccess: () => refetchAccess(),
    }),
  )

  const grantAllSteps = useMutation(
    orpc.access.grantAllStepsToParticipant.mutationOptions({
      onSuccess: () => refetchAccess(),
    }),
  )

  // Bulk mutations (all participants)
  const setStepAccessAll = useMutation(
    orpc.access.setStepAccessForAllParticipants.mutationOptions({
      onSuccess: (data) => {
        alert(`Updated access for ${data.count} participant(s)`)
        refetch()
      },
    }),
  )

  const setSubstepAccessAll = useMutation(
    orpc.access.setSubstepAccessForAllParticipants.mutationOptions({
      onSuccess: (data) => {
        alert(`Updated access for ${data.count} participant(s)`)
        refetch()
      },
    }),
  )

  const setHintAccessAll = useMutation(
    orpc.access.setHintAccessForAllParticipants.mutationOptions({
      onSuccess: (data) => {
        alert(`Updated access for ${data.count} participant(s)`)
        refetch()
      },
    }),
  )

  const setSolutionAccessAll = useMutation(
    orpc.access.setSolutionAccessForAllParticipants.mutationOptions({
      onSuccess: (data) => {
        alert(`Updated access for ${data.count} participant(s)`)
        refetch()
      },
    }),
  )

  const grantAllStepsAll = useMutation(
    orpc.access.grantAllStepsToAllParticipants.mutationOptions({
      onSuccess: (data) => {
        alert(
          `Granted ${data.stepsCount} steps to ${data.participantsCount} participant(s)!`,
        )
        refetch()
      },
    }),
  )

  const removeParticipant = useMutation(
    orpc.participants.remove.mutationOptions({
      onSuccess: () => {
        refetch()
        setSelectedParticipantId(null)
      },
    }),
  )

  if (!session) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  const selectedParticipant = session.participants?.find(
    (p) => p.id === selectedParticipantId,
  )

  // Individual participant handlers
  const handleToggleStepAccess = (stepId: string, currentAccess: boolean) => {
    if (!selectedParticipantId) return
    setStepAccess.mutate({
      participantId: selectedParticipantId,
      stepId,
      hasAccess: !currentAccess,
    })
  }

  const handleToggleSubstepAccess = (
    substepId: string,
    currentAccess: boolean,
  ) => {
    if (!selectedParticipantId) return
    setSubstepAccess.mutate({
      participantId: selectedParticipantId,
      substepId,
      hasAccess: !currentAccess,
    })
  }

  const handleToggleHintAccess = (hintId: string, currentAccess: boolean) => {
    if (!selectedParticipantId) return
    setHintAccess.mutate({
      participantId: selectedParticipantId,
      hintId,
      hasAccess: !currentAccess,
    })
  }

  const handleToggleSolutionAccess = (
    solutionId: string,
    currentAccess: boolean,
  ) => {
    if (!selectedParticipantId) return
    setSolutionAccess.mutate({
      participantId: selectedParticipantId,
      solutionId,
      hasAccess: !currentAccess,
    })
  }

  const handleGrantAllSteps = () => {
    if (!selectedParticipantId) return
    if (confirm('Grant access to all steps for this participant?')) {
      grantAllSteps.mutate({
        participantId: selectedParticipantId,
        workshopId: session.workshop?.id ?? '',
      })
    }
  }

  // Bulk handlers (all participants)
  const handleBulkToggleStep = (stepId: string, grant: boolean) => {
    setStepAccessAll.mutate({
      sessionId: session.id,
      stepId,
      hasAccess: grant,
    })
  }

  const handleBulkToggleSubstep = (substepId: string, grant: boolean) => {
    setSubstepAccessAll.mutate({
      sessionId: session.id,
      substepId,
      hasAccess: grant,
    })
  }

  const handleBulkToggleHint = (hintId: string, grant: boolean) => {
    setHintAccessAll.mutate({
      sessionId: session.id,
      hintId,
      hasAccess: grant,
    })
  }

  const handleBulkToggleSolution = (solutionId: string, grant: boolean) => {
    setSolutionAccessAll.mutate({
      sessionId: session.id,
      solutionId,
      hasAccess: grant,
    })
  }

  const handleBulkGrantAllSteps = () => {
    if (
      confirm(
        `Grant access to ALL steps for ALL ${session.participants?.length} participant(s)?`,
      )
    ) {
      grantAllStepsAll.mutate({
        sessionId: session.id,
        workshopId: session.workshop?.id ?? '',
      })
    }
  }

  const handleRemoveParticipant = (participantId: string) => {
    if (confirm('Are you sure you want to remove this participant?')) {
      removeParticipant.mutate({ id: participantId })
    }
  }

  // Helper to check if item has access
  const hasStepAccess = (stepId: string) => {
    return participantAccess?.steps.find(
      (a) => a.stepId === stepId && a.hasAccess,
    )
  }

  const hasSubstepAccess = (substepId: string) => {
    return participantAccess?.substeps.find(
      (a) => a.substepId === substepId && a.hasAccess,
    )
  }

  const hasHintAccess = (hintId: string) => {
    return participantAccess?.hints.find(
      (a) => a.hintId === hintId && a.hasAccess,
    )
  }

  const hasSolutionAccess = (solutionId: string) => {
    return participantAccess?.solutions.find(
      (a) => a.solutionId === solutionId && a.hasAccess,
    )
  }

  return (
    <PageLayout>
      <PageLayoutTopbar
        startActions={
          <Button variant="ghost" size="icon" aria-label="Go back" asChild>
            <Link to="/manager/sessions">
              <ArrowLeft />
            </Link>
          </Button>
        }
      >
        <span className="flex flex-row items-center gap-2">
          <PageLayoutTitle>{session.name}</PageLayoutTitle>
          <span className="text-lg">-</span>
          <p className="text-gray-600">{session.workshop?.title}</p>
          {session.isActive && <Badge variant="positive">Active</Badge>}
        </span>
      </PageLayoutTopbar>
      <PageLayoutContent>
        <div className="mb-8">
          <div className="mt-4 bg-gray-100 p-4 rounded inline-block">
            <p className="text-sm text-gray-600">Join Code:</p>
            <p className="text-3xl font-bold tracking-wider">{session.code}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Participants List */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">
              Participants ({session.participants?.length || 0})
            </h2>

            {/* Mode Toggle */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkMode}
                  onChange={(e) => {
                    setBulkMode(e.target.checked)
                    if (e.target.checked) {
                      setSelectedParticipantId(null)
                    }
                  }}
                  className="w-4 h-4 mr-2"
                />
                <span className="text-sm font-medium">
                  🎯 Bulk Mode (All Participants)
                </span>
              </label>
              {bulkMode && (
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  Changes apply to ALL participants
                </p>
              )}
            </div>

            {!bulkMode && (
              <div className="space-y-2">
                {session.participants?.map((participant) => (
                  <div
                    key={participant.id}
                    className={`p-4 border rounded cursor-pointer transition-colors ${
                      selectedParticipantId === participant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedParticipantId(participant.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{participant.name}</p>
                        <p className="text-xs text-gray-500">
                          Joined{' '}
                          {new Date(participant.joinedAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveParticipant(participant.id)
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {!session.participants?.length && (
                  <p className="text-gray-500 text-center py-8">
                    No participants yet
                  </p>
                )}
              </div>
            )}

            {bulkMode && (
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="font-semibold text-purple-900">
                    Bulk Access Mode Active
                  </p>
                  <p className="text-sm text-purple-700 mt-2">
                    All {session.participants?.length} participants
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Use controls on the right →
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Access Control */}
          <div className="lg:col-span-2">
            {bulkMode ? (
              // BULK MODE - All Participants
              <div>
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-purple-900">
                        Bulk Access Control
                      </h2>
                      <p className="text-sm text-purple-700 mt-1">
                        Managing access for ALL {session.participants?.length}{' '}
                        participant(s)
                      </p>
                    </div>
                    <button
                      onClick={handleBulkGrantAllSteps}
                      disabled={grantAllStepsAll.isPending}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 font-semibold"
                    >
                      {grantAllStepsAll.isPending
                        ? 'Granting...'
                        : '⚡ Grant ALL Steps'}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {session.workshop?.steps?.map((step, stepIndex) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <button
                          onClick={() => handleBulkToggleStep(step.id, true)}
                          disabled={setStepAccessAll.isPending}
                          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                        >
                          ✓ Grant
                        </button>
                        <button
                          onClick={() => handleBulkToggleStep(step.id, false)}
                          disabled={setStepAccessAll.isPending}
                          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                        >
                          ✗ Revoke
                        </button>
                        <h3 className="text-xl font-semibold">
                          Step {stepIndex + 1}: {step.title}
                        </h3>
                      </div>

                      {(step.substeps?.length ?? 0) > 0 && (
                        <div className="ml-8 space-y-4">
                          {step.substeps?.map((substep, substepIndex) => (
                            <div key={substep.id} className="border-l-2 pl-4">
                              <div className="flex items-center gap-3 mb-3">
                                <button
                                  onClick={() =>
                                    handleBulkToggleSubstep(substep.id, true)
                                  }
                                  disabled={setSubstepAccessAll.isPending}
                                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-medium disabled:opacity-50"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() =>
                                    handleBulkToggleSubstep(substep.id, false)
                                  }
                                  disabled={setSubstepAccessAll.isPending}
                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-medium disabled:opacity-50"
                                >
                                  ✗
                                </button>
                                <h4 className="font-semibold">
                                  {stepIndex + 1}.{substepIndex + 1}{' '}
                                  {substep.title}
                                </h4>
                              </div>

                              <div className="ml-7 space-y-2">
                                {/* Hints */}
                                {(substep.hints?.length ?? 0) > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                      Hints:
                                    </p>
                                    <div className="space-y-1">
                                      {substep.hints?.map((hint, hintIndex) => (
                                        <div
                                          key={hint.id}
                                          className="flex items-center gap-2"
                                        >
                                          <button
                                            onClick={() =>
                                              handleBulkToggleHint(
                                                hint.id,
                                                true,
                                              )
                                            }
                                            disabled={
                                              setHintAccessAll.isPending
                                            }
                                            className="px-2 py-0.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs disabled:opacity-50"
                                          >
                                            ✓
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleBulkToggleHint(
                                                hint.id,
                                                false,
                                              )
                                            }
                                            disabled={
                                              setHintAccessAll.isPending
                                            }
                                            className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs disabled:opacity-50"
                                          >
                                            ✗
                                          </button>
                                          <span className="text-sm">
                                            Hint {hintIndex + 1}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Solutions */}
                                {(substep.solutions?.length ?? 0) > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">
                                      Solutions:
                                    </p>
                                    <div className="space-y-1">
                                      {substep.solutions?.map((solution) => (
                                        <div
                                          key={solution.id}
                                          className="flex items-center gap-2"
                                        >
                                          <button
                                            onClick={() =>
                                              handleBulkToggleSolution(
                                                solution.id,
                                                true,
                                              )
                                            }
                                            disabled={
                                              setSolutionAccessAll.isPending
                                            }
                                            className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs disabled:opacity-50"
                                          >
                                            ✓
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleBulkToggleSolution(
                                                solution.id,
                                                false,
                                              )
                                            }
                                            disabled={
                                              setSolutionAccessAll.isPending
                                            }
                                            className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs disabled:opacity-50"
                                          >
                                            ✗
                                          </button>
                                          <span className="text-sm">
                                            Solution
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedParticipant ? (
              // INDIVIDUAL MODE - Single Participant
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    Access Control: {selectedParticipant.name}
                  </h2>
                  <button
                    onClick={handleGrantAllSteps}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Grant All Steps
                  </button>
                </div>

                <div className="space-y-6">
                  {session.workshop?.steps?.map((step, stepIndex) => {
                    const stepHasAccess = !!hasStepAccess(step.id)
                    return (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="checkbox"
                            checked={stepHasAccess}
                            onChange={() =>
                              handleToggleStepAccess(step.id, stepHasAccess)
                            }
                            className="w-5 h-5"
                          />
                          <h3 className="text-xl font-semibold">
                            Step {stepIndex + 1}: {step.title}
                          </h3>
                        </div>

                        {stepHasAccess && (
                          <div className="ml-8 space-y-4">
                            {step.substeps?.map((substep, substepIndex) => {
                              const substepHasAccess = !!hasSubstepAccess(
                                substep.id,
                              )
                              return (
                                <div
                                  key={substep.id}
                                  className="border-l-2 pl-4"
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <input
                                      type="checkbox"
                                      checked={substepHasAccess}
                                      onChange={() =>
                                        handleToggleSubstepAccess(
                                          substep.id,
                                          substepHasAccess,
                                        )
                                      }
                                      className="w-4 h-4"
                                    />
                                    <h4 className="font-semibold">
                                      {stepIndex + 1}.{substepIndex + 1}{' '}
                                      {substep.title}
                                    </h4>
                                  </div>

                                  {substepHasAccess && (
                                    <div className="ml-7 space-y-2">
                                      {/* Hints */}
                                      {(substep.hints?.length ?? 0) > 0 && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-2">
                                            Hints:
                                          </p>
                                          <div className="space-y-1">
                                            {substep.hints?.map(
                                              (hint, hintIndex) => {
                                                const hintHasAccess =
                                                  !!hasHintAccess(hint.id)
                                                return (
                                                  <div
                                                    key={hint.id}
                                                    className="flex items-center gap-2"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={hintHasAccess}
                                                      onChange={() =>
                                                        handleToggleHintAccess(
                                                          hint.id,
                                                          hintHasAccess,
                                                        )
                                                      }
                                                      className="w-3 h-3"
                                                    />
                                                    <span className="text-sm">
                                                      Hint {hintIndex + 1}
                                                    </span>
                                                  </div>
                                                )
                                              },
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Solutions */}
                                      {(substep.solutions?.length ?? 0) > 0 && (
                                        <div>
                                          <p className="text-sm font-medium text-gray-600 mb-2">
                                            Solutions:
                                          </p>
                                          <div className="space-y-1">
                                            {substep.solutions?.map(
                                              (solution) => {
                                                const solutionHasAccess =
                                                  !!hasSolutionAccess(
                                                    solution.id,
                                                  )
                                                return (
                                                  <div
                                                    key={solution.id}
                                                    className="flex items-center gap-2"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={
                                                        solutionHasAccess
                                                      }
                                                      onChange={() =>
                                                        handleToggleSolutionAccess(
                                                          solution.id,
                                                          solutionHasAccess,
                                                        )
                                                      }
                                                      className="w-3 h-3"
                                                    />
                                                    <span className="text-sm">
                                                      Solution
                                                    </span>
                                                  </div>
                                                )
                                              },
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a participant to manage their access
              </div>
            )}
          </div>
        </div>
      </PageLayoutContent>
    </PageLayout>
  )
}
