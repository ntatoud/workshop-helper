import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, PlusIcon } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Form } from '@/components/form'
import { Button } from '@/components/ui/button'
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTitle,
  PageLayoutTopbar,
} from '@/layouts/manager/page-layout'
import { useAppForm } from '@/lib/form'
import {
  FormSessionNew,
  sessionNewFormOptions,
} from '@/features/session/manager/form-session-new'
import { orpc } from '@/orpc/client'
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button'

export function PageSessionNew() {
  const navigate = useNavigate()

  const createSession = useMutation(
    orpc.sessions.create.mutationOptions({
      onSuccess: async (data) => {
        await navigate({
          to: '/manager/sessions/$sessionId',
          params: {
            sessionId: data.id,
          },
        })
      },
    }),
  )

  const form = useAppForm({
    ...sessionNewFormOptions,
    onSubmit: ({ value }) => {
      createSession.mutate(value)
    },
  })

  return (
    <Form form={form}>
      <PageLayout>
        <PageLayoutTopbar
          startActions={
            <Button variant="ghost" size="icon" aria-label="Go back" asChild>
              <Link to="/manager/sessions">
                <ArrowLeft />
              </Link>
            </Button>
          }
          endActions={
            <ResponsiveIconButton
              variant="outline"
              type="submit"
              label="Create"
            >
              <PlusIcon />
            </ResponsiveIconButton>
          }
        >
          <PageLayoutTitle>New Session</PageLayoutTitle>
        </PageLayoutTopbar>
        <PageLayoutContent>
          <FormSessionNew form={form} />
        </PageLayoutContent>
      </PageLayout>
    </Form>
  )
}
