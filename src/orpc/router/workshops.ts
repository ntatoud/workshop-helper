// src/orpc/router/workshops.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { workshops } from '@/db/schema'

const router = os
  .$context<{ headers: Headers }>()
  .prefix('/workshops')
  .router({
    // Create a new workshop
    create: os
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
        }),
      )
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

    // List all workshops
    list: os.handler(async () => {
      const test = await db.query.workshops.findMany({
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

      return test
    }),

    // Get a single workshop with all details
    get: os.input(z.object({ id: z.number() })).handler(async ({ input }) => {
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
        throw new Error('Workshop not found')
      }

      return workshop
    }),

    // Update workshop
    update: os
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          description: z.string().optional(),
        }),
      )
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

    // Delete workshop
    delete: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input }) => {
        await db.delete(workshops).where(eq(workshops.id, input.id))
        return { success: true }
      }),
  })

export default router
