import { useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { getUiState } from '@bearstudio/ui-state'
import { CheckCircle2, Download, Lightbulb, Lock, Unlock } from 'lucide-react'
import { orpc } from '@/orpc/client'
import { Skeleton } from '@/components/ui/skeleton'
import { SessionEmptyAccess } from '@/features/session/session-empty-access'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CodeWithCopy } from '@/components/code-with-copy'
import { Button } from '@/components/ui/button'

const REFETCH_ACCESSES_INTERVAL_SECONDS = 5
const REFETCH_ACCESSES_INTERVAL_MS = REFETCH_ACCESSES_INTERVAL_SECONDS * 1000

export function PageSession({
  params: { participantId },
}: {
  params: { participantId: string }
}) {
  const participantQuery = useQuery(
    orpc.participants.get.queryOptions({
      input: { id: participantId },
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
    <div className="flex flex-1 flex-col">
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

      <main className="flex flex-1 h-full">
        <aside className="flex flex-col w-40 items-center justify-center">
          <Button asChild>
            <a href="/sprites/dungeon.png" download="dungeon.png">
              Textures <Download />
            </a>
          </Button>
        </aside>
        <article className="container mx-auto px-4 py-8 max-w-5xl prose">
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
            .match('default', ({ workshopContent }) =>
              workshopContent.steps.map((step, index) => (
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

                        <div className="space-y-6 w-full max-w-3xl">
                          {substep.hints.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Need a nudge?
                              </h4>
                              <Accordion
                                type="single"
                                collapsible
                                className="w-full not-prose space-y-2"
                              >
                                {substep.hints.map((hint, hintIndex) => (
                                  <AccordionItem
                                    value={hint.id}
                                    key={hint.id}
                                    className="border border-amber-200 bg-amber-50/50 rounded-md overflow-hidden"
                                  >
                                    <AccordionTrigger className="px-4 py-3 hover:bg-amber-100/50 hover:no-underline group">
                                      <div className="flex items-center gap-3 text-amber-900">
                                        {/* Icon swaps based on open state */}
                                        <Lightbulb className="w-4 h-4 text-amber-600 group-data-[state=open]:fill-amber-600 transition-colors" />

                                        <span className="font-medium group-data-[state=open]:hidden">
                                          Reveal Hint {hintIndex + 1}
                                        </span>
                                        <span className="font-medium hidden group-data-[state=open]:inline-block">
                                          Hint {hintIndex + 1}
                                        </span>
                                      </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="px-4 pb-4 pt-1">
                                      <div className="pl-7 text-amber-900/90 leading-relaxed text-sm">
                                        {hint.content}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </div>
                          )}

                          {/* --- SOLUTIONS SECTION --- */}
                          {substep.solutions.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Answer Key
                              </h4>
                              <Accordion
                                type="single"
                                collapsible
                                className="w-full not-prose space-y-3"
                              >
                                {substep.solutions.map((solution) => (
                                  <AccordionItem
                                    value={solution.id}
                                    key={solution.id}
                                    className="border border-slate-200 rounded-lg bg-white overflow-hidden"
                                  >
                                    <AccordionTrigger className="px-4 py-3 bg-slate-50 hover:bg-slate-100 hover:no-underline group border-b border-transparent data-[state=open]:border-slate-200 transition-all">
                                      <div className="flex items-center gap-3 text-slate-700">
                                        {/* Icon swaps based on open state */}
                                        <Lock className="w-4 h-4 text-slate-400 group-data-[state=open]:hidden" />
                                        <Unlock className="w-4 h-4 text-indigo-500 hidden group-data-[state=open]:block" />

                                        <span className="font-medium group-data-[state=open]:hidden">
                                          View Solution
                                        </span>
                                        <span className="font-medium hidden group-data-[state=open]:inline-block text-indigo-700">
                                          Solution Revealed
                                        </span>
                                      </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="bg-white">
                                      <div className="flex flex-col">
                                        <CodeWithCopy code={solution.content} />

                                        {solution.explanation && (
                                          <div className="p-4 bg-indigo-50/30 flex gap-3 text-sm text-slate-700">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                              <strong className="font-semibold text-indigo-900 block">
                                                Why this works
                                              </strong>
                                              <p className="leading-relaxed text-slate-600">
                                                {solution.explanation}
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </div>
                          )}
                        </div>
                      </section>
                    ))}
                  </section>
                </Fragment>
              )),
            )
            .exhaustive()}
        </article>
      </main>
    </div>
  )
}
