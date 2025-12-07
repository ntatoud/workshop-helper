import { FieldLabel } from '@/components/ui/field'
import { useFieldContext } from '@/lib/form/context'

type FormFieldLabelProps = React.ComponentProps<typeof FieldLabel> & {
  required?: boolean
}

export function FormFieldLabel({
  children,
  required,
  ...rest
}: FormFieldLabelProps) {
  const field = useFieldContext()

  return (
    <FieldLabel htmlFor={field.name} {...rest}>
      {children}
      {required && <span className="text-red-600 -ml-1">*</span>}
    </FieldLabel>
  )
}
