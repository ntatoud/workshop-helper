import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'

import { toast } from 'sonner'
import { ArrowRight, Settings } from 'lucide-react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ManagerOnly } from '@/features/auth/manager-only'
import { Form } from '@/components/form'

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
          to: '/app/$participantId',
          params: {
            participantId: participant.id.toString(),
          },
        })
      } catch (err: any) {
        toast.error(err.message || 'Failed to join session')
      }
    },
  })

  return (
    <Form form={form}>
      <div className="min-h-screen flex flex-col items-center gap-8 justify-center bg-linear-to-br from-blue-50 to-indigo-100">
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
                      type="submit"
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

        <ManagerOnly>
          <Link
            to="/manager/workshops"
            aria-label="Go to manager panel"
            className="w-full max-w-md"
          >
            <Alert className="relative w-full">
              <Settings />

              <ArrowRight className="absolute top-3 right-3" />
              <AlertTitle>Manager</AlertTitle>
              <AlertDescription>
                Gère les worshops et les sessions en direct.
              </AlertDescription>
            </Alert>
          </Link>
        </ManagerOnly>
      </div>
    </Form>
  )
}
