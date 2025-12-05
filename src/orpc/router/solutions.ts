// src/orpc/router/solutions.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { solutions } from '@/db/schema'

const router = os
  .$context<{ headers: Headers }>()
  .prefix('/solutions')
  .router({
    // Create a new solution
    create: os
      .input(
        z.object({
          substepId: z.number(),
          content: z.string().min(1),
          explanation: z.string().optional(),
        }),
      )
      .handler(async ({ input }) => {
        const [solution] = await db
          .insert(solutions)
          .values({
            substepId: input.substepId,
            content: input.content,
            explanation: input.explanation,
          })
          .returning()

        return solution
      }),

    // Update solution
    update: os
      .input(
        z.object({
          id: z.number(),
          content: z.string().min(1).optional(),
          explanation: z.string().optional(),
        }),
      )
      .handler(async ({ input }) => {
        const [solution] = await db
          .update(solutions)
          .set({
            content: input.content,
            explanation: input.explanation,
            updatedAt: new Date(),
          })
          .where(eq(solutions.id, input.id))
          .returning()

        return solution
      }),

    // Delete solution
    delete: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input }) => {
        await db.delete(solutions).where(eq(solutions.id, input.id))
        return { success: true }
      }),
  })

export default router
