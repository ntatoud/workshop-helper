import { z } from 'zod'
import { zHint } from '@/features/hint/schema'
import { zSolution } from '@/features/solution/schema'

export type Substep = z.input<ReturnType<typeof zSubstep>>
export const zSubstep = () =>
  z.object({
    id: z.number(),
    stepId: z.number(),
    title: z.string().min(1),
    description: z.string().nullable(),
    content: z.string().nullable(),
    order: z.number(),
    hints: z.array(zHint()).optional(),
    solutions: z.array(zSolution()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
