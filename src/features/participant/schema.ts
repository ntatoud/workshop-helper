import { z } from 'zod'

export type Participant = z.input<ReturnType<typeof zParticipant>>
export const zParticipant = () =>
  z.object({
    id: z.number(),
    sessionId: z.number(),
    name: z.string().min(1),
    joinedAt: z.date(),
  })

export type ParticipantJoinFormFields = z.input<
  ReturnType<typeof zParticipantJoinFormFields>
>
export const zParticipantJoinFormFields = () =>
  zParticipant().pick({
    sessionId: true,
    name: true,
  })
