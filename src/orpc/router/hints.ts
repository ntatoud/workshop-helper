// src/orpc/router/hints.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { hints } from '@/db/schema'

const router = os
  .$context<{ headers: Headers }>()
  .prefix('/hints')
  .router({
    // Create a new hint
    create: os
      .input(
        z.object({
          substepId: z.number(),
          content: z.string().min(1),
          order: z.number(),
        }),
      )
      .handler(async ({ input }) => {
        const [hint] = await db
          .insert(hints)
          .values({
            substepId: input.substepId,
            content: input.content,
            order: input.order,
          })
          .returning()

        return hint
      }),

    // Update hint
    update: os
      .input(
        z.object({
          id: z.number(),
          content: z.string().min(1).optional(),
          order: z.number().optional(),
        }),
      )
      .handler(async ({ input }) => {
        const [hint] = await db
          .update(hints)
          .set({
            content: input.content,
            order: input.order,
          })
          .where(eq(hints.id, input.id))
          .returning()

        return hint
      }),

    // Delete hint
    delete: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input }) => {
        await db.delete(hints).where(eq(hints.id, input.id))
        return { success: true }
      }),
  })

export default router
