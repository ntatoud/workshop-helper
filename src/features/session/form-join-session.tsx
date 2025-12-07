import { formOptions } from '@tanstack/react-form'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'

import type { SessionJoinFormFields } from '@/features/session/schema'
import { withForm } from '@/lib/form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

import { zSessionJoinFormFields } from '@/features/session/schema'

export const joinSessionFormOptions = formOptions({
  defaultValues: {
    name: '',
    code: '',
  } as SessionJoinFormFields,
  validators: {
    onSubmit: zSessionJoinFormFields(),
  },
})

export const FormJoinSession = withForm({
  ...joinSessionFormOptions,
  render: ({ form }) => {
    return (
      <>
        <form.AppField
          name="name"
          children={(field) => {
            return (
              <Field>
                <field.Label required>Your Name</field.Label>
                <field.Text placeholder="Enter your name" />
              </Field>
            )
          }}
        />

        <form.AppField
          name="code"
          children={(field) => {
            return (
              <Field>
                <field.Label required>Session Code</field.Label>

                <div className="flex w-full justify-center">
                  <InputOTP
                    id={field.name}
                    name={field.name}
                    maxLength={6}
                    value={field.state.value}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    onChange={(code) => field.handleChange(code)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </Field>
            )
          }}
        />

        <form.AppForm>
          <form.Subscribe
            selector={(state) => state.errors}
            children={(errors) => {
              return <FieldError errors={errors} />
            }}
          />
        </form.AppForm>
      </>
    )
  },
})
