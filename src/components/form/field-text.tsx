import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useFieldContext } from '@/lib/form/context'

type FieldTextProps = Omit<React.ComponentProps<typeof Input>, 'value'>

export function FieldText(props: FieldTextProps) {
  const field = useFieldContext<string>()

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <>
      <Input
        id="form-tanstack-input-username"
        name={field.name}
        value={field.state.value}
        type="text"
        aria-invalid={isInvalid}
        {...props}
        onBlur={(e) => {
          field.handleBlur()
          props.onBlur?.(e)
        }}
        onChange={(e) => {
          field.handleChange(e.target.value)
          props.onChange?.(e)
        }}
      />
      <FieldError errors={field.state.meta.errors} />
    </>
  )
}
