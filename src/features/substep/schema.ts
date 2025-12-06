import { z } from 'zod'
import { zHint } from '@/features/hint/schema'
import { zSolution } from '@/features/solution/schema'

export type Substep = z.input<ReturnType<typeof zSubstep>>
export const zSubstep = () =>
  z.object({
    id: z.number(),
    stepId: z.number(),
    title: z.string().min(1),
    description: z.string().nullish(),
    content: z.string().nullish(),
    order: z.number(),
    hints: z.array(zHint()).optional(),
    solutions: z.array(zSolution()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })

export type SubstepCreateFormFields = z.input<
  ReturnType<typeof zSubstepCreateFormFields>
>
export const zSubstepCreateFormFields = () =>
  zSubstep().pick({
    stepId: true,
    title: true,
    description: true,
    content: true,
    order: true,
  })

export type SubstepUpdateFormFields = z.input<
  ReturnType<typeof zSubstepUpdateFormFields>
>
export const zSubstepUpdateFormFields = () =>
  zSubstep()
    .pick({
      id: true,
      title: true,
      description: true,
    })
    .extend({
      content: zSubstep().shape.content.optional(),
      order: zSubstep().shape.order.optional(),
    })
