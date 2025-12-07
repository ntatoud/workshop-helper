import { ORPCError, os } from '@orpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { participants } from '@/db/schema'
import { zParticipant } from '@/features/participant/schema'
import { zSession } from '@/features/session/schema'

const router = {
  join: os
    .input(
      zParticipant().pick({
        sessionId: true,
        name: true,
      }),
    )
    .output(zParticipant())
    .handler(async ({ input }) => {
      try {
        const [participant] = await db
          .insert(participants)
          .values({
            sessionId: input.sessionId,
            name: input.name,
          })
          .returning()

        return participant
      } catch (error: any) {
        if (error.code === '23505') {
          // Unique constraint violation
          throw new ORPCError('CONFLICT')
        }
        throw error
      }
    }),

  get: os
    .input(zParticipant().pick({ id: true }))
    .output(
      zParticipant().extend({
        session: zSession(),
      }),
    )
    .handler(async ({ input }) => {
      const participant = await db.query.participants.findFirst({
        where: eq(participants.id, input.id),
        with: {
          session: {
            with: {
              workshop: true,
            },
          },
        },
      })

      if (!participant) {
        throw new Error('Participant not found')
      }

      return participant
    }),

  listBySession: os
    .input(z.object({ sessionId: z.string() }))
    .output(z.array(zParticipant()))
    .handler(async ({ input }) => {
      return await db.query.participants.findMany({
        where: eq(participants.sessionId, input.sessionId),
        orderBy: (p, { asc }) => [asc(p.joinedAt)],
      })
    }),

  remove: os
    .input(zParticipant().pick({ id: true }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      await db.delete(participants).where(eq(participants.id, input.id))
      return { success: true }
    }),
}

export default os.prefix('/participants').tag('participants').router(router)
