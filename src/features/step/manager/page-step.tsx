import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getUiState } from '@bearstudio/ui-state'
import { LandPlot, PencilLine, Trash2Icon } from 'lucide-react'
import { z } from 'zod'
import { useEffect } from 'react'
import { toast } from 'sonner'

import type { SubstepFormFields } from '@/features/substep/schema'
import { zSubstepFormFields } from '@/features/substep/schema'
import { orpc } from '@/orpc/client'

import { MarkdownRenderer } from '@/components/markdown-render'
import { PageLayout, PageLayoutContent } from '@/layouts/manager/page-layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { useAppForm } from '@/lib/form'
import { Form } from '@/components/form'
import { Field, FieldLegend, FieldSet } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'

const emptySubstepValues = {
  id: null,
  title: '',
  content: '',
  description: '',
  confirmed: false,
  hints: [],
  solutions: [],
} satisfies SubstepFormFields

/**
 * Contained inside of the PageWorkshop layout
 */
export function PageStep({
  params,
}: {
  params: {
    workshopId: string
    stepId: string
  }
}) {
  const { workshopId, stepId } = params
  const queryClient = useQueryClient()

  const stepQuery = useQuery(
    orpc.workshops.get.queryOptions({
      input: {
        id: workshopId,
      },
      select: (workshop) => workshop.steps?.find((s) => s.id === stepId),
    }),
  )

  const createSubstep = useMutation(orpc.substeps.create.mutationOptions())
  const updateSubstep = useMutation(orpc.substeps.update.mutationOptions())

  const deleteSubstep = useMutation(
    orpc.substeps.delete.mutationOptions({
      onSuccess: async (_data, _variables, _result, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.workshops.get.queryKey({
            input: {
              id: workshopId,
            },
          }),
        })

        toast.success('Substep deleted successfuly')
      },
    }),
  )

  const saveOrUpdateSubstep = async (substep: SubstepFormFields) => {
    if (!substep.id) {
      return await createSubstep.mutateAsync({
        stepId,
        title: substep.title,
        content: substep.content,
        description: substep.description,
        confirmed: substep.confirmed,
      })
    }

    await updateSubstep.mutateAsync({
      id: substep.id,
      title: substep.title,
      content: substep.content,
      description: substep.description,
      confirmed: substep.confirmed,
    })
  }

  const substepsForm = useAppForm({
    defaultValues: {
      substeps: stepQuery.data?.substeps ?? [],
    } as { substeps: Array<SubstepFormFields> },

    validators: {
      onChange: z.object({
        substeps: z.array(zSubstepFormFields()),
      }),
    },
    onSubmit: async ({ value }) => {
      for (const substep of value.substeps) {
        await saveOrUpdateSubstep(substep)
      }

      await queryClient.invalidateQueries({
        queryKey: orpc.workshops.get.queryKey({
          input: {
            id: workshopId,
          },
        }),
      })
    },
  })

  const ui = getUiState((set) => {
    if (stepQuery.isLoading) return set('pending')
    if (!stepQuery.isSuccess) return set('error')
    if (!stepQuery.data) return set('not-found')

    return set('default', { step: stepQuery.data })
  })

  const substepsUi = () =>
    getUiState((set) => {
      // This is called inside of ui.match('default'), hence always defined
      const step = stepQuery.data!
      const formSubsteps = substepsForm.getFieldValue('substeps')
      if (!formSubsteps.length) return set('empty')

      return set('default', { substeps: step.substeps })
    })

  // When navigating between steps OR when the step query data refreshes,
  // reset the form with the *latest* API data.
  useEffect(() => {
    if (!stepQuery.data) return

    substepsForm.reset({
      substeps: stepQuery.data.substeps ?? [],
    })
  }, [stepId, stepQuery.dataUpdatedAt])

  return (
    <PageLayout className="px-8">
      <div className="flex flex-row w-full">
        {ui
          .match('pending', () => <Skeleton className="w-20 h-6" />)
          .match(['not-found', 'error'], () => <>???</>)
          .match('default', ({ step }) => (
            <h2 className="text-lg md:text-xl items-center">
              Étape : {step.title}
            </h2>
          ))
          .exhaustive()}
        <Button
          type="submit"
          form="substeps"
          className="ml-auto"
          variant="outline"
        >
          Save Step
        </Button>
      </div>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('not-found', () => <>Step not found</>)
          .match('error', () => <>Error...</>)
          .match('default', ({ step }) => (
            <>
              {step.description && (
                <div className="prose max-w-none p-4 pt-2">
                  {step.description}
                </div>
              )}

              {step.content && (
                <div className="mb-8 prose max-w-none bg-gray-50 p-6 rounded">
                  <MarkdownRenderer content={step.content} />
                </div>
              )}

              <Form
                form={substepsForm}
                id="substeps"
                key={step.substeps?.length}
              >
                <substepsForm.AppForm>
                  <substepsForm.PreventNavigation confirmMessage="You are about to drop the changes made to this step" />
                </substepsForm.AppForm>

                <substepsForm.AppField
                  name="substeps"
                  mode="array"
                  children={(field) => {
                    return substepsUi()
                      .match('empty', () => (
                        <StepEmptyState
                          onCreate={() => field.pushValue(emptySubstepValues)}
                        />
                      ))
                      .match('default', () => (
                        <div className="space-y-4">
                          {field.state.value.map((substep, i) => {
                            if (substep.confirmed) {
                              return (
                                <div
                                  onClick={() => {
                                    field.replaceValue(i, {
                                      ...substep,
                                      confirmed: false,
                                    })
                                  }}
                                  className="cursor-pointer hover:bg-muted px-4 py-2 rounded-md w-fit"
                                >
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold">
                                      {substep.title}
                                    </h3>
                                    <Button
                                      size="icon-sm"
                                      title="Edit substep"
                                      variant="ghost"
                                    >
                                      <PencilLine />
                                    </Button>
                                  </div>
                                  <div>{substep.description}</div>
                                  <div>{substep.content}</div>
                                </div>
                              )
                            }

                            return (
                              <>
                                <FieldSet key={i}>
                                  <FieldLegend className="sr-only">
                                    Substep
                                  </FieldLegend>
                                  <substepsForm.AppField
                                    name={`substeps[${i}].title`}
                                    children={(subField) => (
                                      <subField.Container>
                                        <subField.Label required>
                                          Title
                                        </subField.Label>
                                        <subField.Text />
                                      </subField.Container>
                                    )}
                                  />
                                  <substepsForm.AppField
                                    name={`substeps[${i}].description`}
                                    children={(subField) => (
                                      <subField.Container>
                                        <subField.Label>
                                          Description
                                        </subField.Label>
                                        <subField.Textarea />
                                      </subField.Container>
                                    )}
                                  />
                                  <substepsForm.AppField
                                    name={`substeps[${i}].content`}
                                    children={(subField) => (
                                      <subField.Container>
                                        <subField.Label>Content</subField.Label>
                                        <subField.Textarea />
                                      </subField.Container>
                                    )}
                                  />
                                  {/* <substepsForm.AppField
                                  name={`substeps[${i}].hints`}
                                  children={(subField) => (
                                    <subField.Container>
                                      <subField.Label>Hints</subField.Label>
                                      <subField.Textarea />
                                    </subField.Container>
                                  )}
                                />
                                <substepsForm.AppField
                                  name={`substeps[${i}].solutions`}
                                  children={(subField) => (
                                    <subField.Container>
                                      <subField.Label>Solutions</subField.Label>
                                      <subField.Textarea />
                                    </subField.Container>
                                  )}
                                />*/}
                                  <Field orientation="horizontal">
                                    <Button
                                      onClick={() => {
                                        if (
                                          !confirm(
                                            'Are you sure you want to delete this substep ?',
                                          )
                                        )
                                          return

                                        if (substep.id) {
                                          deleteSubstep.mutate({
                                            id: substep.id,
                                          })
                                        }
                                        field.removeValue(i)
                                      }}
                                      className="ml-auto"
                                      variant="outline"
                                    >
                                      <Trash2Icon />
                                      Delete
                                    </Button>
                                    <substepsForm.Subscribe
                                      selector={(state) => state.isValid}
                                      children={(isValid) => (
                                        <Button
                                          onClick={() => {
                                            if (!isValid) {
                                              return
                                            }

                                            field.replaceValue(i, {
                                              ...substep,
                                              confirmed: true,
                                            })
                                          }}
                                          disabled={
                                            !isValid ||
                                            updateSubstep.isPending ||
                                            createSubstep.isPending
                                          }
                                        >
                                          Confirm
                                        </Button>
                                      )}
                                    />
                                  </Field>
                                </FieldSet>
                                {i !== field.state.value.length - 1 && (
                                  <Separator />
                                )}
                              </>
                            )
                          })}
                          <Button
                            type="submit"
                            className="ml-auto"
                            onClick={() => field.pushValue(emptySubstepValues)}
                          >
                            New substep
                          </Button>
                        </div>
                      ))
                      .exhaustive()
                  }}
                />
              </Form>
            </>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  )
}

function StepEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LandPlot />
        </EmptyMedia>
        <EmptyTitle>No Substeps Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any substeps yet. Get started by creating
          your first substep.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreate}>Create your first substep</Button>
      </EmptyContent>
    </Empty>
  )
}
