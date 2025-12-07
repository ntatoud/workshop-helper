import { z } from 'zod'
import { zStep } from '@/features/step/schema'

export type Workshop = z.input<ReturnType<typeof zWorkshop>>
export const zWorkshop = () =>
  z.object({
    id: z.string(),
    title: z.string().min(1),
    description: z.string().nullish(),
    steps: z.array(zStep()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })

export type WorkshopCreateFormFields = z.input<
  ReturnType<typeof zWorkshopCreateFormFields>
>
export const zWorkshopCreateFormFields = () =>
  zWorkshop().pick({
    title: true,
    description: true,
  })

export type WorkshopUpdateFormFields = z.input<
  ReturnType<typeof zWorkshopUpdateFormFields>
>
export const zWorkshopUpdateFormFields = () =>
  zWorkshop()
    .pick({
      id: true,
      description: true,
    })
    .extend({
      title: zWorkshop().shape.title.optional(),
    })
