import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, FlagTriangleRight, Trash2Icon } from 'lucide-react'
import { getUiState } from '@bearstudio/ui-state'
import { orpc } from '@/orpc/client'
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTitle,
  PageLayoutTopbar,
} from '@/layouts/manager/page-layout'
import { Button } from '@/components/ui/button'
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { useGoToFirstStep } from '@/features/workshop/manager/use-go-to-first-step'

export function PageWorkshop({ params }: { params: { workshopId: string } }) {
  const navigate = useNavigate()

  const workshopQuery = useQuery(
    orpc.workshops.get.queryOptions({
      input: {
        id: params.workshopId,
      },
      select: (workshop) => {
        return {
          ...workshop,
          firstStep: workshop.steps?.[0],
        }
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

  const deleteStep = useMutation(
    orpc.steps.delete.mutationOptions({
      onSuccess: async (_data, _variables, _result, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.workshops.get.queryKey({
            input: { id: params.workshopId },
          }),
        })

        await navigate({
          to: '/manager/workshops/$workshopId',
          params: { workshopId: params.workshopId },
        })
      },
    }),
  )

  useGoToFirstStep(params.workshopId, workshopQuery.data?.firstStep)

  const ui = getUiState((set) => {
    if (workshopQuery.isLoading) return set('pending')
    if (!workshopQuery.isSuccess) return set('error')

    return set('default', { workshop: workshopQuery.data })
  })

  const stepsUi = getUiState((set) => {
    if (!workshopQuery.data?.steps?.length) return set('empty')
    return set('default', { steps: workshopQuery.data.steps })
  })

  return (
    <PageLayout>
      <PageLayoutTopbar
        startActions={
          <Button
            variant="ghost"
            asChild
            title="Retour à la liste des workshops"
            size="icon"
          >
            <Link to="/manager/workshops">
              <ArrowLeft />
            </Link>
          </Button>
        }
        endActions={
          <ResponsiveIconButton
            variant="ghost"
            onClick={() => {
              if (confirm('Are you sure you want to delete this workshop?')) {
                deleteWorkshop.mutate({ id: params.workshopId })
              }
            }}
            label="Delete"
            title="Delete this workshop"
          >
            <Trash2Icon />
          </ResponsiveIconButton>
        }
      >
        <PageLayoutTitle>
          {ui
            .match('pending', () => <Skeleton className="h-6 w-20" />)
            .match('error', () => <>Error...</>)
            .match('default', ({ workshop }) => <>Workshop: {workshop.title}</>)
            .exhaustive()}
        </PageLayoutTitle>
      </PageLayoutTopbar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full className="size-12" />)
          .match('error', () => <>Error...</>)
          .match('default', ({ workshop }) => (
            <div className="flex flex-col flex-1 gap-4">
              {workshop.description && (
                <div className="prose max-w-none px-4">
                  {workshop.description}
                </div>
              )}
              {stepsUi
                .match('empty', () => (
                  <WorkshopEmptyState workshopId={workshop.id} />
                ))
                .match('default', () => (
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex w-full max-w-xs flex-col gap-2">
                      {workshop.steps?.map((step, index) => (
                        <Link
                          to="/manager/workshops/$workshopId/steps/$stepId"
                          params={{ workshopId: workshop.id, stepId: step.id }}
                          aria-label={`See ${step.title}`}
                        >
                          {({ isActive }) => {
                            return (
                              <Item
                                variant={isActive ? 'muted' : 'default'}
                                key={step.id}
                                size="sm"
                                className="group"
                              >
                                <ItemContent>
                                  <ItemTitle>
                                    {index + 1}. {step.title}
                                  </ItemTitle>
                                </ItemContent>
                                <ItemActions>
                                  <Button
                                    variant="ghost"
                                    title="Delete step"
                                    className="invisible group-hover:visible"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      if (
                                        confirm(
                                          'Are you sure you want to delete this step?',
                                        )
                                      ) {
                                        deleteStep.mutate({ id: step.id })
                                      }
                                    }}
                                  >
                                    <Trash2Icon />
                                  </Button>
                                </ItemActions>
                              </Item>
                            )
                          }}
                        </Link>
                      ))}
                      <Item
                        variant="outline"
                        size="sm"
                        className="border-dashed"
                        asChild
                      >
                        <Link
                          to="/manager/workshops/$workshopId/steps/new"
                          params={{ workshopId: workshop.id }}
                        >
                          <ItemContent>
                            <ItemTitle>Add an other step</ItemTitle>
                          </ItemContent>
                          <ItemActions>
                            <Button variant="outline">Create</Button>
                          </ItemActions>
                        </Link>
                      </Item>
                    </div>

                    <div className="w-full h-full">
                      <Outlet />
                    </div>
                  </div>
                ))
                .exhaustive()}
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  )
}

function WorkshopEmptyState({ workshopId }: { workshopId: string }) {
  const location = useLocation()

  if (location.href.endsWith('new')) {
    return <Outlet />
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FlagTriangleRight />
        </EmptyMedia>
        <EmptyTitle>No Steps Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any steps yet. Get started by creating your
          first step.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link
            to="/manager/workshops/$workshopId/steps/new"
            params={{ workshopId }}
          >
            Create your first step
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
