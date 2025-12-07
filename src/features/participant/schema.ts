import { z } from 'zod'

export type Participant = z.input<ReturnType<typeof zParticipant>>
export const zParticipant = () =>
  z.object({
    id: z.string(),
    sessionId: z.string(),
    name: z.string().min(1),
    joinedAt: z.date(),
  })
