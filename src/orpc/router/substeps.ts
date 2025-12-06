import { os } from '@orpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { substeps } from '@/db/schema'
import {
  zSubstep,
  zSubstepCreateFormFields,
  zSubstepUpdateFormFields,
} from '@/features/substep/schema'

const router = {
  create: os
    .input(zSubstepCreateFormFields())
    .output(zSubstep())
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

  update: os
    .input(zSubstepUpdateFormFields())
    .output(zSubstep())
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

  delete: os
    .input(zSubstep().pick({ id: true }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      await db.delete(substeps).where(eq(substeps.id, input.id))
      return { success: true }
    }),
}

export default os
  .$context<{ headers: Headers }>()
  .prefix('/substeps')
  .tag('substeps')
  .router(router)
