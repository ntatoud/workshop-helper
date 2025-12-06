import { z } from 'zod'

export type Hint = z.input<ReturnType<typeof zHint>>
export const zHint = () =>
  z.object({
    id: z.number(),
    substepId: z.number(),
    content: z.string(),
    order: z.number(),
    createdAt: z.date(),
  })
