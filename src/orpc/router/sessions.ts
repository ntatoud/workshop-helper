// src/orpc/router/sessions.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { sessions } from '@/db/schema'

// Helper function to generate a unique session code
function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const router = os
  .$context<{ headers: Headers }>()
  .prefix('/sessions')
  .router({
    // Create a new session
    create: os
      .input(
        z.object({
          workshopId: z.number(),
          name: z.string().min(1),
        }),
      )
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

    // List all sessions
    list: os.handler(async () => {
      return await db.query.sessions.findMany({
        orderBy: desc(sessions.createdAt),
        with: {
          workshop: true,
          participants: true,
        },
      })
    }),

    // Get session by ID
    get: os.input(z.object({ id: z.number() })).handler(async ({ input }) => {
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
        throw new Error('Session not found')
      }

      return session
    }),

    // Get session by code (for participants)
    getByCode: os
      .input(z.object({ code: z.string() }))
      .handler(async ({ input }) => {
        const session = await db.query.sessions.findFirst({
          where: eq(sessions.code, input.code.toUpperCase()),
          with: {
            workshop: true,
          },
        })

        if (!session) {
          throw new Error('Session not found')
        }

        if (!session.isActive) {
          throw new Error('Session is no longer active')
        }

        return session
      }),

    // Update session
    update: os
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          isActive: z.boolean().optional(),
        }),
      )
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

    // End session
    end: os.input(z.object({ id: z.number() })).handler(async ({ input }) => {
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

    // Delete session
    delete: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input }) => {
        await db.delete(sessions).where(eq(sessions.id, input.id))
        return { success: true }
      }),
  })

export default router
