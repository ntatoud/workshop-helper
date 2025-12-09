import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { PlusIcon } from 'lucide-react'
import { orpc } from '@/orpc/client'
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTitle,
  PageLayoutTopbar,
} from '@/layouts/manager/page-layout'
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button'

export function PageWorkshopListing() {
  const { data: workshops } = useQuery(orpc.workshops.list.queryOptions())

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops?.map((workshop) => (
            <Link
              key={workshop.id}
              to="/manager/workshops/$workshopId"
              params={{ workshopId: workshop.id }}
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{workshop.title}</h3>
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

        {!workshops?.length && (
          <div className="text-center py-12 text-gray-500">
            No workshops yet. Create your first workshop to get started!
          </div>
        )}
      </PageLayoutContent>
    </PageLayout>
  )
}
