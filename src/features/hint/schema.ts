import { z } from 'zod'

export type Hint = z.input<ReturnType<typeof zHint>>
export const zHint = () =>
  z.object({
    id: z.number(),
    substepId: z.number(),
    content: z.string().min(1),
    order: z.number(),
    createdAt: z.date(),
  })

export type HintCreateFormFields = z.input<
  ReturnType<typeof zHintCreateFormFields>
>
export const zHintCreateFormFields = () =>
  zHint().pick({ substepId: true, content: true, order: true })

export type HintUpdateFormFields = z.input<
  ReturnType<typeof zHintUpdateFormFields>
>
export const zHintUpdateFormFields = () =>
  zHint().pick({ id: true, order: true }).extend({
    content: zHint().shape.content.optional(),
    order: zHint().shape.order.optional(),
  })
