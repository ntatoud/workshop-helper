import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Form } from '@/components/form'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import {
  FormStepNew,
  stepNewFormOptions,
} from '@/features/step/manager/form-step-new'
import { useAppForm } from '@/lib/form'
import { orpc } from '@/orpc/client'

export function PageStepNew({
  params,
}: {
  params: {
    workshopId: string
  }
}) {
  const navigate = useNavigate()
  const createStep = useMutation(
    orpc.steps.create.mutationOptions({
      onSuccess: async (data, _variables, _results, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.workshops.get.queryKey({
            input: { id: params.workshopId },
          }),
        })

        await navigate({
          to: '/manager/workshops/$workshopId/steps/$stepId',
          params: {
            workshopId: params.workshopId,
            stepId: data.id,
          },
        })
      },
      onError: () => {
        toast.error('Step creation failed')
      },
    }),
  )

  const form = useAppForm({
    ...stepNewFormOptions,
    onSubmit: ({ value }) => {
      createStep.mutate({
        workshopId: params.workshopId,
        title: value.title,
        description: value.description,
      })
    },
  })

  return (
    <Form form={form}>
      <div className="space-y-4">
        <FormStepNew form={form} />
        <Field orientation="horizontal">
          <Button
            type="submit"
            className="ml-auto"
            disabled={createStep.isPending}
          >
            Confirm
          </Button>
        </Field>
      </div>
    </Form>
  )
}
