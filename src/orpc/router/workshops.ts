import { ORPCError, os } from '@orpc/server'
import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { workshops } from '@/db/schema'
import {
  zWorkshop,
  zWorkshopCreateFormFields,
  zWorkshopUpdateFormFields,
} from '@/features/workshop/schema'

const router = {
  create: os
    .input(zWorkshopCreateFormFields())
    .output(zWorkshop())
    .handler(async ({ input }) => {
      const [workshop] = await db
        .insert(workshops)
        .values({
          title: input.title,
          description: input.description,
        })
        .returning()

      return workshop
    }),

  list: os
    .input(z.void())
    .output(z.array(zWorkshop()))
    .handler(async () => {
      return await db.query.workshops.findMany({
        orderBy: desc(workshops.createdAt),
        with: {
          steps: {
            orderBy: (steps, { asc }) => [asc(steps.order)],
            with: {
              substeps: {
                orderBy: (substeps, { asc }) => [asc(substeps.order)],
              },
            },
          },
        },
      })
    }),

  get: os
    .input(zWorkshop().pick({ id: true }))
    .output(zWorkshop())
    .handler(async ({ input }) => {
      const workshop = await db.query.workshops.findFirst({
        where: eq(workshops.id, input.id),
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
      })

      if (!workshop) {
        throw new ORPCError('NOT_FOUND', { message: 'Workshop not found' })
      }

      return workshop
    }),

  update: os
    .input(zWorkshopUpdateFormFields())
    .output(zWorkshop())
    .handler(async ({ input }) => {
      const [workshop] = await db
        .update(workshops)
        .set({
          title: input.title,
          description: input.description,
          updatedAt: new Date(),
        })
        .where(eq(workshops.id, input.id))
        .returning()

      return workshop
    }),

  delete: os
    .input(zWorkshop().pick({ id: true }))
    .output(z.object({ success: z.boolean }))
    .handler(async ({ input }) => {
      await db.delete(workshops).where(eq(workshops.id, input.id))
      return { success: true }
    }),
}

export default os.prefix('/workshops').tag('workshops').router(router)
