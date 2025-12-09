import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFieldContext } from '@/lib/form/context'

export function FieldSelect({
  options,
  placeholder,
  ...rest
}: React.ComponentProps<typeof Select> & {
  placeholder?: string
  options: Array<{ id: string; label: React.ReactNode }>
}) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Select
      name={field.name}
      value={field.state.value}
      onValueChange={field.handleChange}
      {...rest}
    >
      <SelectTrigger aria-invalid={isInvalid} id={field.name}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="item-aligned">
        {options.map((option) => (
          <SelectItem value={option.id} key={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
