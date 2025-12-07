import { z } from 'zod'
import { zSubstep } from '@/features/substep/schema'

export type Step = z.input<ReturnType<typeof zStep>>
export const zStep = () =>
  z.object({
    id: z.string(),
    workshopId: z.string(),
    title: z.string().min(1),
    description: z.string().nullable(),
    content: z.string().nullable(),
    order: z.number(),
    substeps: z.array(zSubstep()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })

export type StepCreateFormFields = z.input<
  ReturnType<typeof zStepCreateFormFields>
>
export const zStepCreateFormFields = () =>
  zStep().pick({
    workshopId: true,
    title: true,
    description: true,
    content: true,
    order: true,
  })

export type StepUpdateFormFields = z.input<
  ReturnType<typeof zStepUpdateFormFields>
>
export const zStepUpdateFormFields = () =>
  zStep()
    .pick({
      id: true,
      title: true,
      description: true,
    })
    .extend({
      content: zStep().shape.content.optional(),
      order: zStep().shape.order.optional(),
    })
