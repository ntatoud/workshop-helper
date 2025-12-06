import { ORPCError, os } from '@orpc/server'
import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { sessions } from '@/db/schema'
import {
  zSession,
  zSessionCreateFormFields,
  zSessionUpdateFormFields,
} from '@/features/session/schema'

// Helper function to generate a unique session code
function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const router = {
  create: os
    .input(zSessionCreateFormFields())
    .output(zSession())
    .handler(async ({ input }) => {
      const code = generateSessionCode()

      const [session] = await db
        .insert(sessions)
        .values({
          workshopId: input.workshopId,
          name: input.name,
          code,
          isActive: true,
        })
        .returning()

      return session
    }),

  list: os
    .input(z.void())
    .output(z.array(zSession()))
    .handler(async () => {
      return await db.query.sessions.findMany({
        orderBy: desc(sessions.createdAt),
        with: {
          workshop: true,
          participants: true,
        },
      })
    }),

  get: os
    .input(zSession().pick({ id: true }))
    .output(zSession())
    .handler(async ({ input }) => {
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, input.id),
        with: {
          workshop: {
            with: {
              steps: {
                orderBy: (steps, { asc }) => [asc(steps.order)],
                with: {
                  substeps: {
                    orderBy: (substeps, { asc }) => [asc(substeps.order)],
                    with: {
                      hints: {
                        orderBy: (hints, { asc }) => [asc(hints.order)],
                      },
                      solutions: true,
                    },
                  },
                },
              },
            },
          },
          participants: true,
        },
      })

      if (!session) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Session not found',
        })
      }

      return session
    }),

  // Get session by code (for participants)
  getByCode: os
    .input(zSession().pick({ code: true }))
    .output(zSession())
    .handler(async ({ input }) => {
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.code, input.code.toUpperCase()),
        with: {
          workshop: true,
        },
      })

      if (!session) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Session not found',
        })
      }

      if (!session.isActive) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Session has ended',
        })
      }

      return session
    }),

  update: os
    .input(zSessionUpdateFormFields())
    .output(zSession())
    .handler(async ({ input }) => {
      const updateData: any = {}
      if (input.name !== undefined) updateData.name = input.name
      if (input.isActive !== undefined) updateData.isActive = input.isActive

      const [session] = await db
        .update(sessions)
        .set(updateData)
        .where(eq(sessions.id, input.id))
        .returning()

      return session
    }),

  end: os
    .input(zSession().pick({ id: true }))
    .output(zSession())
    .handler(async ({ input }) => {
      const [session] = await db
        .update(sessions)
        .set({
          isActive: false,
          endedAt: new Date(),
        })
        .where(eq(sessions.id, input.id))
        .returning()

      return session
    }),

  delete: os
    .input(zSession().pick({ id: true }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      await db.delete(sessions).where(eq(sessions.id, input.id))
      return { success: true }
    }),
}

export default os.prefix('/sessions').tag('sessions').router(router)
