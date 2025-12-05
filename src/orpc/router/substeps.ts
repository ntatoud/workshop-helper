// src/orpc/router/substeps.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { substeps } from '@/db/schema'

const router = os
  .$context<{ headers: Headers }>()
  .prefix('/substeps')
  .router({
    // Create a new substep
    create: os
      .input(
        z.object({
          stepId: z.number(),
          title: z.string().min(1),
          description: z.string().optional(),
          content: z.string().optional(),
          order: z.number(),
        }),
      )
      .handler(async ({ input }) => {
        const [substep] = await db
          .insert(substeps)
          .values({
            stepId: input.stepId,
            title: input.title,
            description: input.description,
            content: input.content,
            order: input.order,
          })
          .returning()

        return substep
      }),

    // Update substep
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
        const [substep] = await db
          .update(substeps)
          .set({
            title: input.title,
            description: input.description,
            content: input.content,
            order: input.order,
            updatedAt: new Date(),
          })
          .where(eq(substeps.id, input.id))
          .returning()

        return substep
      }),

    // Delete substep
    delete: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input }) => {
        await db.delete(substeps).where(eq(substeps.id, input.id))
        return { success: true }
      }),
  })

export default router
