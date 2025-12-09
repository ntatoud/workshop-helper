import { Block } from '@tanstack/react-router'
import { useFormContext } from '@/lib/form/context'

export function FormPreventNavigation(props: { confirmMessage: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe
      selector={(state) =>
        state.isDirty && !state.isDefaultValue && !state.isSubmitSuccessful
      }
    >
      {(shouldBlock) => (
        <Block
          shouldBlockFn={() => {
            if (!shouldBlock) return false

            const shouldLeave = confirm(props.confirmMessage)
            return !shouldLeave
          }}
          enableBeforeUnload={shouldBlock}
        />
      )}
    </form.Subscribe>
  )
}
