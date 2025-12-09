import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from '@/lib/form/context'
import { FieldText } from '@/components/form/field-text'
import { FormFieldLabel } from '@/components/form/form-field-label'
import { FormField } from '@/components/form/form-field'
import { FieldTextarea } from '@/components/form/field-textarea'
import { FormPreventNavigation } from '@/components/form/form-prevent-navigation'
import { FieldSelect } from '@/components/form/field-select'

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Text: FieldText,
    Textarea: FieldTextarea,
    Select: FieldSelect,
    Label: FormFieldLabel,
    Container: FormField,
  },
  formComponents: {
    PreventNavigation: FormPreventNavigation,
  },
  fieldContext,
  formContext,
})
