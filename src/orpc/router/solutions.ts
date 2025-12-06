import { os } from '@orpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { solutions } from '@/db/schema'
import {
  zSolution,
  zSolutionCreateFormFields,
  zSolutionUpdateFormFields,
} from '@/features/solution/schema'

const router = {
  create: os
    .input(zSolutionCreateFormFields())
    .output(zSolution())
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

  update: os
    .input(zSolutionUpdateFormFields())
    .output(zSolution())
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

  delete: os
    .input(zSolution().pick({ id: true }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      await db.delete(solutions).where(eq(solutions.id, input.id))
      return { success: true }
    }),
}

export default os.prefix('/solutions').tag('solutions').router(router)
