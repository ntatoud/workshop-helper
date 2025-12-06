import { os } from '@orpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { steps } from '@/db/schema'
import {
  zStep,
  zStepCreateFormFields,
  zStepUpdateFormFields,
} from '@/features/step/schema'

const router = {
  create: os
    .input(zStepCreateFormFields())
    .output(zStep())
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

  update: os
    .input(zStepUpdateFormFields())
    .output(zStep())
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

  delete: os
    .input(zStep().pick({ id: true }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      await db.delete(steps).where(eq(steps.id, input.id))
      return { success: true }
    }),
}

export default os
  .$context<{ headers: Headers }>()
  .prefix('/steps')
  .tag('steps')
  .router(router)
