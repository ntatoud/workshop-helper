import { formOptions } from '@tanstack/react-form'
import type { StepCreateFormFields } from '@/features/step/schema'
import { zStepCreateFormFields } from '@/features/step/schema'
import { withForm } from '@/lib/form'
import { FieldLegend, FieldSet } from '@/components/ui/field'

export const stepNewFormOptions = formOptions({
  defaultValues: {
    title: '',
    content: null,
    description: null,
    workshopId: '',
  } as StepCreateFormFields,
  validators: {
    onSubmit: zStepCreateFormFields(),
  },
})

export const FormStepNew = withForm({
  ...stepNewFormOptions,
  render: ({ form }) => (
    <FieldSet>
      <FieldLegend>New step</FieldLegend>

      <form.AppField
        name="title"
        children={(field) => (
          <field.Container>
            <field.Label required>Title</field.Label>
            <field.Text placeholder="Step title" autoFocus />
          </field.Container>
        )}
      />

      <form.AppField
        name="description"
        children={(field) => (
          <field.Container>
            <field.Label required>Description</field.Label>
            <field.Textarea placeholder="Step description" rows={3} />
          </field.Container>
        )}
      />
    </FieldSet>
  ),
})
