import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { orpc } from '@/orpc/client'
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTitle,
  PageLayoutTopbar,
} from '@/layouts/manager/page-layout'
import { Button } from '@/components/ui/button'
import { useAppForm } from '@/lib/form'
import { Form } from '@/components/form'
import {
  FormWorkshopNew,
  workshopNewFormOptions,
} from '@/features/workshop/manager/form-workshop-new'

export function PageWorkshopNew() {
  const navigate = useNavigate()

  const createWorkshop = useMutation(
    orpc.workshops.create.mutationOptions({
      onSuccess: async (data, _variables, _result, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.workshops.list.key(),
        })

        await navigate({
          to: '/manager/workshops/$workshopId',
          params: {
            workshopId: data.id,
          },
        })
      },
    }),
  )

  const form = useAppForm({
    ...workshopNewFormOptions,
    onSubmit: ({ value }) => {
      createWorkshop.mutate(value)
    },
  })

  return (
    <Form form={form}>
      <PageLayout>
        <PageLayoutTopbar
          startActions={
            <Link to="/manager/workshops">
              <Button title="Go back" size="icon" variant="ghost">
                <ArrowLeft />
              </Button>
            </Link>
          }
          endActions={
            <Button type="submit" disabled={createWorkshop.isPending}>
              Create
            </Button>
          }
        >
          <PageLayoutTitle>New Workshop</PageLayoutTitle>
        </PageLayoutTopbar>
        <PageLayoutContent>
          <FormWorkshopNew form={form} />
        </PageLayoutContent>
      </PageLayout>
    </Form>
  )
}
