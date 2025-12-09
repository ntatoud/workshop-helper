import { Field } from '@/components/ui/field'
import { useFieldContext } from '@/lib/form/context'

export function FormField(props: React.ComponentProps<typeof Field>) {
  const field = useFieldContext()

  return (
    <Field
      data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
      {...props}
    />
  )
}
