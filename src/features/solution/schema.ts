import { z } from 'zod'

export type Solution = z.input<ReturnType<typeof zSolution>>
export const zSolution = () =>
  z.object({
    id: z.number(),
    substepId: z.number(),
    content: z.string(),
    explanation: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
