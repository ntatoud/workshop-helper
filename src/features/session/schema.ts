import { z } from 'zod'
import { zWorkshop } from '@/features/workshop/schema'
import { zParticipant } from '@/features/participant/schema'

export type Session = z.input<ReturnType<typeof zSession>>
export const zSession = () =>
  z.object({
    id: z.number(),
    workshopId: z.number(),
    workshop: zWorkshop().optional(),
    participants: z.array(zParticipant()).optional(),
    name: z.string().min(1),
    code: z.string().min(5),
    isActive: z.boolean(),
    startedAt: z.date(),
    endedAt: z.date().nullable(),
    createdAt: z.date(),
  })

export type SessionCreateFormFields = z.input<
  ReturnType<typeof zSessionCreateFormFields>
>
export const zSessionCreateFormFields = () =>
  zSession().pick({
    workshopId: true,
    name: true,
  })

export type SessionUpdateFormFields = z.input<
  ReturnType<typeof zSessionUpdateFormFields>
>
export const zSessionUpdateFormFields = () =>
  zSession()
    .pick({
      id: true,
    })
    .extend({
      name: zSession().shape.name.optional(),
      isActive: zSession().shape.isActive.optional(),
    })

export type SessionJoinFormFields = z.input<
  ReturnType<typeof zSessionJoinFormFields>
>

export const zSessionJoinFormFields = () =>
  z.object({
    name: z.string().min(1),
    code: zSession().shape.code,
  })
