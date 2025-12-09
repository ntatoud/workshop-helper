import { FieldError } from '@/components/ui/field'

import { Textarea } from '@/components/ui/textarea'
import { useFieldContext } from '@/lib/form/context'

type FieldTextareaProps = Omit<React.ComponentProps<typeof Textarea>, 'value'>

export function FieldTextarea(props: FieldTextareaProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return (
    <>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        {...props}
        onBlur={(e) => {
          field.handleBlur()
          props.onBlur?.(e)
        }}
        onChange={(e) => {
          field.handleChange(e.target.value)
          props.onChange?.(e)
        }}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </>
  )
}
