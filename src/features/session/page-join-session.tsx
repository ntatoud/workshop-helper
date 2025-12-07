import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'
import { orpc } from '@/orpc/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldSet } from '@/components/ui/field'
import { useAppForm } from '@/lib/form'
import {
  FormJoinSession,
  joinSessionFormOptions,
} from '@/features/session/form-join-session'

export function PageJoinSession() {
  const navigate = useNavigate()

  const getSession = useMutation(orpc.sessions.getByCode.mutationOptions())
  const joinSession = useMutation(orpc.participants.join.mutationOptions())

  const form = useAppForm({
    ...joinSessionFormOptions,
    onSubmit: async ({ value }) => {
      try {
        const session = await getSession.mutateAsync({
          code: value.code.toUpperCase(),
        })

        const participant = await joinSession.mutateAsync({
          sessionId: session.id,
          name: value.name,
        })

        navigate({
          to: '/app/$sessionId/$participantId',
          params: {
            sessionId: session.id.toString(),
            participantId: participant.id.toString(),
          },
        })
      } catch (err: any) {
        toast.error(err.message || 'Failed to join session')
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Join Workshop</CardTitle>
          </CardHeader>

          <CardContent>
            <FieldSet>
              <FormJoinSession form={form} />
              <Field>
                <form.Subscribe
                  selector={(state) => ({
                    values: state.values,
                  })}
                  children={({ values }) => (
                    <Button
                      size="lg"
                      disabled={
                        !values.code ||
                        !values.name ||
                        getSession.isPending ||
                        joinSession.isPending
                      }
                      className="w-full"
                    >
                      {getSession.isPending || joinSession.isPending
                        ? 'Joining...'
                        : 'Join Session'}
                    </Button>
                  )}
                />
              </Field>
            </FieldSet>
          </CardContent>

          <CardFooter>
            <p>Get the session code from your workshop manager</p>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
