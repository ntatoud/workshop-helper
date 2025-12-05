// src/orpc/router/participants.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { participants } from '@/db/schema'

const router = os
  .$context<{ headers: Headers }>()
  .prefix('/participants')
  .router({
    // Join a session (participant registration)
    join: os
      .input(
        z.object({
          sessionId: z.number(),
          name: z.string().min(1),
        }),
      )
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
            throw new Error(
              'A participant with this name already exists in this session',
            )
          }
          throw error
        }
      }),

    // Get participant by ID
    get: os.input(z.object({ id: z.number() })).handler(async ({ input }) => {
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

    // List participants in a session
    listBySession: os
      .input(z.object({ sessionId: z.number() }))
      .handler(async ({ input }) => {
        return await db.query.participants.findMany({
          where: eq(participants.sessionId, input.sessionId),
          orderBy: (participants, { asc }) => [asc(participants.joinedAt)],
        })
      }),

    // Remove participant from session
    remove: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input }) => {
        await db.delete(participants).where(eq(participants.id, input.id))
        return { success: true }
      }),
  })

export default router
