import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { Hammer, PlusIcon } from 'lucide-react'
import { getUiState } from '@bearstudio/ui-state'
import { orpc } from '@/orpc/client'
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTitle,
  PageLayoutTopbar,
} from '@/layouts/manager/page-layout'
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'

export function PageWorkshopListing() {
  const workshopsQuery = useQuery(orpc.workshops.list.queryOptions())

  const ui = getUiState((set) => {
    if (workshopsQuery.isLoading) return set('pending')
    if (!workshopsQuery.isSuccess) return set('error')
    if (workshopsQuery.data.length === 0) return set('empty')

    return set('default', { workshops: workshopsQuery.data })
  })
  return (
    <PageLayout>
      <PageLayoutTopbar
        endActions={
          <Link to="/manager/workshops/new">
            <ResponsiveIconButton label="New Workshop">
              <PlusIcon />
            </ResponsiveIconButton>
          </Link>
        }
      >
        <PageLayoutTitle>Workshops</PageLayoutTitle>
      </PageLayoutTopbar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <Spinner full />)
          .match('error', () => <>Error...</>)
          .match('empty', () => <WorkshopsEmptyState />)
          .match('default', ({ workshops }) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map((workshop) => (
                <Link
                  key={workshop.id}
                  to="/manager/workshops/$workshopId"
                  params={{ workshopId: workshop.id }}
                  className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {workshop.title}
                  </h3>
                  {workshop.description && (
                    <p className="text-gray-600 line-clamp-3">
                      {workshop.description}
                    </p>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    {workshop.steps?.length || 0} steps
                  </div>
                </Link>
              ))}
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  )
}

function WorkshopsEmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Hammer />
        </EmptyMedia>
        <EmptyTitle>No Workshops Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any workshop yet. Get started by creating
          your first workshop.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link to="/manager/workshops/new">Create your first workshop</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
