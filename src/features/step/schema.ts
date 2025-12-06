import { z } from 'zod'
import { zSubstep } from '@/features/substep/schema'

export type Step = z.input<ReturnType<typeof zStep>>
export const zStep = () =>
  z.object({
    id: z.number(),
    workshopId: z.number(),
    title: z.string().min(1),
    description: z.string().nullable(),
    content: z.string().nullable(),
    order: z.number(),
    substeps: z.array(zSubstep()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
