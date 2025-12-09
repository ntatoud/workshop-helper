import { formOptions } from '@tanstack/react-form'
import type { WorkshopCreateFormFields } from '@/features/workshop/schema'
import { zWorkshopCreateFormFields } from '@/features/workshop/schema'
import { withForm } from '@/lib/form'

export const workshopNewFormOptions = formOptions({
  defaultValues: {
    title: '',
    description: '',
  } as WorkshopCreateFormFields,
  validators: {
    onSubmit: zWorkshopCreateFormFields(),
  },
})

export const FormWorkshopNew = withForm({
  ...workshopNewFormOptions,
  render: ({ form }) => (
    <div className="space-y-4 max-w-4xl mx-auto">
      <form.AppField
        name="title"
        children={(field) => (
          <field.Container>
            <field.Label required>Title</field.Label>
            <field.Text placeholder="Workshop Title" />
          </field.Container>
        )}
      />

      <form.AppField
        name="description"
        children={(field) => (
          <field.Container>
            <field.Label>Description</field.Label>
            <field.Textarea placeholder="Workshop description" rows={4} />
          </field.Container>
        )}
      />
    </div>
  ),
})
