import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from '@/lib/form/context'
import { FieldText } from '@/components/form/field-text'
import { FormFieldLabel } from '@/components/form/form-field-label'

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Text: FieldText,
    Label: FormFieldLabel,
  },
  formComponents: {},
  fieldContext,
  formContext,
})
