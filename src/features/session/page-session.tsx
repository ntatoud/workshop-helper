import { useQuery } from '@tanstack/react-query'
import { Fragment, useState } from 'react'
import { getUiState } from '@bearstudio/ui-state'
import { orpc } from '@/orpc/client'
import { Skeleton } from '@/components/ui/skeleton'
import { SessionEmptyAccess } from '@/features/session/session-empty-access'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const REFETCH_ACCESSES_INTERVAL_SECONDS = 5
const REFETCH_ACCESSES_INTERVAL_MS = REFETCH_ACCESSES_INTERVAL_SECONDS * 1000

export function PageSession({
  params: { participantId },
}: {
  params: { participantId: string }
}) {
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set())
  const [revealedSolutions, setRevealedSolutions] = useState<Set<string>>(
    new Set(),
  )

  const participantQuery = useQuery(
    orpc.participants.get.queryOptions({
      input: {
        id: participantId,
      },
    }),
  )

  const workshopContentQuery = useQuery(
    orpc.access.getWorkshopWithAccess.queryOptions({
      input: {
        participantId: participantId,
        workshopId: participantQuery.data?.session.workshop?.id ?? '',
      },
      enabled: !!participantQuery.data?.session.workshop?.id,
      refetchInterval: REFETCH_ACCESSES_INTERVAL_MS,
    }),
  )

  const revealHint = (hintId: string) => {
    setRevealedHints(new Set([...revealedHints, hintId]))
  }

  const revealSolution = (solutionId: string) => {
    setRevealedSolutions(new Set([...revealedSolutions, solutionId]))
  }

  const ui = getUiState((set) => {
    if (participantQuery.isLoading || workshopContentQuery.isLoading)
      return set('pending')

    if (!(participantQuery.isSuccess && workshopContentQuery.isSuccess))
      return set('error')

    if (workshopContentQuery.data.steps.length === 0)
      return set('empty', { participant: participantQuery.data })

    return set('default', {
      participant: participantQuery.data,
      workshopContent: workshopContentQuery.data,
    })
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {ui
            .match('pending', () => (
              <div className="flex flex-col gap-1">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))
            .match('error', () => <div>Error...</div>)
            .match(['default', 'empty'], ({ participant }) => (
              <>
                <h1 className="text-2xl font-bold">
                  {participant.session.workshop?.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {participant.name} · Session:{' '}
                  {participant.session.name}
                </p>
              </>
            ))
            .exhaustive()}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {ui
          .match('pending', () => (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-xl">Loading...</div>
            </div>
          ))
          .match('error', () => (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-xl">Error...</div>
            </div>
          ))
          .match('empty', () => <SessionEmptyAccess />)
          .match('default', ({ workshopContent }) => (
            <article className="container mx-auto px-4 py-8 max-w-5xl prose">
              {workshopContent.steps.map((step, index) => (
                <Fragment key={step.id}>
                  {index !== 0 && <Separator />}
                  <section>
                    <h2>{step.title}</h2>
                    {step.description && (
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    )}
                    {step.content && <p>{step.content}</p>}

                    {step.substeps.map((substep) => (
                      <section key={substep.id}>
                        <h3>{substep.title}</h3>
                        {substep.description && (
                          <p className="text-muted-foreground">
                            {substep.description}
                          </p>
                        )}
                        {substep.content && <p>{substep.content}</p>}

                        {/* Hints */}
                        {substep.hints.length > 0 && (
                          <aside className="not-prose">
                            <h4 className="text-base font-semibold mb-3">
                              💡 Hints
                            </h4>
                            <div className="space-y-2">
                              {substep.hints.map((hint, hintIndex) => (
                                <div key={hint.id}>
                                  {revealedHints.has(hint.id) ? (
                                    <details
                                      open
                                      className="bg-yellow-50 border border-yellow-200 p-4 rounded"
                                    >
                                      <summary className="font-medium text-yellow-900 cursor-pointer list-none">
                                        Hint {hintIndex + 1}
                                      </summary>
                                      <p className="mt-2 text-sm text-yellow-900">
                                        {hint.content}
                                      </p>
                                    </details>
                                  ) : (
                                    <button
                                      onClick={() => revealHint(hint.id)}
                                      className="w-full text-left px-4 py-3 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded text-sm font-medium transition-colors"
                                    >
                                      🔒 Click to reveal Hint {hintIndex + 1}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </aside>
                        )}

                        {/* Solutions */}
                        {substep.solutions.length > 0 && (
                          <aside className="not-prose my-6">
                            <h4 className="text-base font-semibold mb-3">
                              ✅ Solution
                            </h4>
                            <div className="space-y-2">
                              {substep.solutions.map((solution) => (
                                <div key={solution.id}>
                                  {revealedSolutions.has(solution.id) ? (
                                    <details
                                      open
                                      className="bg-green-50 border border-green-200 p-4 rounded"
                                    >
                                      <summary className="font-medium text-green-900 cursor-pointer list-none">
                                        Solution
                                      </summary>
                                      <code className="mt-3 p-3 bg-white rounded text-sm overflow-x-auto">
                                        {solution.content}
                                      </code>
                                      {solution.explanation && (
                                        <div className="mt-3 text-sm text-green-900">
                                          <strong>Explanation:</strong>
                                          <p className="mt-1">
                                            {solution.explanation}
                                          </p>
                                        </div>
                                      )}
                                    </details>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        revealSolution(solution.id)
                                      }
                                      className="w-full text-left px-4 py-3 bg-green-100 hover:bg-green-200 border border-green-300 rounded font-semibold transition-colors"
                                    >
                                      🔒 Click to reveal Solution
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </aside>
                        )}
                      </section>
                    ))}
                  </section>
                </Fragment>
              ))}
            </article>
          ))
          .exhaustive()}
      </main>
    </div>
  )
}
