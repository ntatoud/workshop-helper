// src/orpc/router/steps.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { steps } from '@/db/schema'

const router = os
  .$context<{ headers: Headers }>()
  .prefix('/steps')
  .router({
    // Create a new step
    create: os
      .input(
        z.object({
          workshopId: z.number(),
          title: z.string().min(1),
          description: z.string().optional(),
          content: z.string().optional(),
          order: z.number(),
        }),
      )
      .handler(async ({ input }) => {
        const [step] = await db
          .insert(steps)
          .values({
            workshopId: input.workshopId,
            title: input.title,
            description: input.description,
            content: input.content,
            order: input.order,
          })
          .returning()

        return step
      }),

    // Update step
    update: os
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          description: z.string().optional(),
          content: z.string().optional(),
          order: z.number().optional(),
        }),
      )
      .handler(async ({ input }) => {
        const [step] = await db
          .update(steps)
          .set({
            title: input.title,
            description: input.description,
            content: input.content,
            order: input.order,
            updatedAt: new Date(),
          })
          .where(eq(steps.id, input.id))
          .returning()

        return step
      }),

    // Delete step
    delete: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input }) => {
        await db.delete(steps).where(eq(steps.id, input.id))
        return { success: true }
      }),
  })

export default router
