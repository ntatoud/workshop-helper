import { formOptions } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import type { SessionCreateFormFields } from '@/features/session/schema'
import { zSessionCreateFormFields } from '@/features/session/schema'
import { withForm } from '@/lib/form'
import { orpc } from '@/orpc/client'
import { FieldLegend, FieldSet } from '@/components/ui/field'

export const sessionNewFormOptions = formOptions({
  defaultValues: {
    name: '',
    workshopId: '',
  } as SessionCreateFormFields,
  validators: {
    onSubmit: zSessionCreateFormFields(),
  },
})

export const FormSessionNew = withForm({
  ...sessionNewFormOptions,
  render: ({ form }) => {
    const workshopsQuery = useQuery(orpc.workshops.list.queryOptions())

    return (
      <FieldSet className="max-w-4xl mx-auto">
        <FieldLegend className="sr-only">New Session</FieldLegend>

        <form.AppField
          name="name"
          children={(field) => (
            <field.Container>
              <field.Label required>Name</field.Label>
              <field.Text placeholder="Name of the session..." />
            </field.Container>
          )}
        />

        <form.AppField
          name="workshopId"
          children={(field) => (
            <field.Container>
              <field.Label required>Workshop</field.Label>
              <field.Select
                placeholder="Select a workshop"
                options={
                  workshopsQuery.data?.map((workshop) => ({
                    id: workshop.id,
                    label: workshop.title,
                  })) ?? []
                }
              />
            </field.Container>
          )}
        />
      </FieldSet>
    )
  },
})
