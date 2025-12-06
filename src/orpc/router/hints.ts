import { os } from '@orpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { hints } from '@/db/schema'
import {
  zHint,
  zHintCreateFormFields,
  zHintUpdateFormFields,
} from '@/features/hint/schema'

const router = {
  create: os
    .input(zHintCreateFormFields())
    .output(zHint())
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

  update: os
    .input(zHintUpdateFormFields())
    .output(zHint())
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

  delete: os
    .input(zHint().pick({ id: true }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      await db.delete(hints).where(eq(hints.id, input.id))
      return { success: true }
    }),
}

export default os.prefix('/hints').tag('hints').router(router)
