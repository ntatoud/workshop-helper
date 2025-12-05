// src/orpc/router/access.ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import {
  hintAccess,
  participants as participantsTable,
  solutionAccess,
  stepAccess,
  steps,
  substepAccess,
} from '@/db/schema'

const router = os
  .$context<{ headers: Headers }>()
  .prefix('/access')
  .router({
    // Grant/revoke step access
    setStepAccess: os
      .input(
        z.object({
          participantId: z.number(),
          stepId: z.number(),
          hasAccess: z.boolean(),
        }),
      )
      .handler(async ({ input }) => {
        const existing = await db.query.stepAccess.findFirst({
          where: and(
            eq(stepAccess.participantId, input.participantId),
            eq(stepAccess.stepId, input.stepId),
          ),
        })

        if (existing) {
          const [access] = await db
            .update(stepAccess)
            .set({
              hasAccess: input.hasAccess,
              grantedAt: new Date(),
            })
            .where(eq(stepAccess.id, existing.id))
            .returning()

          return access
        } else {
          const [access] = await db
            .insert(stepAccess)
            .values({
              participantId: input.participantId,
              stepId: input.stepId,
              hasAccess: input.hasAccess,
            })
            .returning()

          return access
        }
      }),

    // Grant/revoke substep access
    setSubstepAccess: os
      .input(
        z.object({
          participantId: z.number(),
          substepId: z.number(),
          hasAccess: z.boolean(),
        }),
      )
      .handler(async ({ input }) => {
        const existing = await db.query.substepAccess.findFirst({
          where: and(
            eq(substepAccess.participantId, input.participantId),
            eq(substepAccess.substepId, input.substepId),
          ),
        })

        if (existing) {
          const [access] = await db
            .update(substepAccess)
            .set({
              hasAccess: input.hasAccess,
              grantedAt: new Date(),
            })
            .where(eq(substepAccess.id, existing.id))
            .returning()

          return access
        } else {
          const [access] = await db
            .insert(substepAccess)
            .values({
              participantId: input.participantId,
              substepId: input.substepId,
              hasAccess: input.hasAccess,
            })
            .returning()

          return access
        }
      }),

    // Grant/revoke hint access
    setHintAccess: os
      .input(
        z.object({
          participantId: z.number(),
          hintId: z.number(),
          hasAccess: z.boolean(),
        }),
      )
      .handler(async ({ input }) => {
        const existing = await db.query.hintAccess.findFirst({
          where: and(
            eq(hintAccess.participantId, input.participantId),
            eq(hintAccess.hintId, input.hintId),
          ),
        })

        if (existing) {
          const [access] = await db
            .update(hintAccess)
            .set({
              hasAccess: input.hasAccess,
              grantedAt: new Date(),
            })
            .where(eq(hintAccess.id, existing.id))
            .returning()

          return access
        } else {
          const [access] = await db
            .insert(hintAccess)
            .values({
              participantId: input.participantId,
              hintId: input.hintId,
              hasAccess: input.hasAccess,
            })
            .returning()

          return access
        }
      }),

    // Grant/revoke solution access
    setSolutionAccess: os
      .input(
        z.object({
          participantId: z.number(),
          solutionId: z.number(),
          hasAccess: z.boolean(),
        }),
      )
      .handler(async ({ input }) => {
        const existing = await db.query.solutionAccess.findFirst({
          where: and(
            eq(solutionAccess.participantId, input.participantId),
            eq(solutionAccess.solutionId, input.solutionId),
          ),
        })

        if (existing) {
          const [access] = await db
            .update(solutionAccess)
            .set({
              hasAccess: input.hasAccess,
              grantedAt: new Date(),
            })
            .where(eq(solutionAccess.id, existing.id))
            .returning()

          return access
        } else {
          const [access] = await db
            .insert(solutionAccess)
            .values({
              participantId: input.participantId,
              solutionId: input.solutionId,
              hasAccess: input.hasAccess,
            })
            .returning()

          return access
        }
      }),

    // Bulk operations for easier management
    grantAllStepsToParticipant: os
      .input(
        z.object({
          participantId: z.number(),
          workshopId: z.number(),
        }),
      )
      .handler(async ({ input }) => {
        // Get all steps for the workshop
        const workshopSteps = await db.query.steps.findMany({
          where: eq(steps.workshopId, input.workshopId),
        })

        const results = []
        for (const step of workshopSteps) {
          const existing = await db.query.stepAccess.findFirst({
            where: and(
              eq(stepAccess.participantId, input.participantId),
              eq(stepAccess.stepId, step.id),
            ),
          })

          if (existing) {
            const [access] = await db
              .update(stepAccess)
              .set({ hasAccess: true, grantedAt: new Date() })
              .where(eq(stepAccess.id, existing.id))
              .returning()
            results.push(access)
          } else {
            const [access] = await db
              .insert(stepAccess)
              .values({
                participantId: input.participantId,
                stepId: step.id,
                hasAccess: true,
              })
              .returning()
            results.push(access)
          }
        }

        return results
      }),

    // Get all access for a participant
    getParticipantAccess: os
      .input(z.object({ participantId: z.number() }))
      .handler(async ({ input }) => {
        const [
          stepAccessList,
          substepAccessList,
          hintAccessList,
          solutionAccessList,
        ] = await Promise.all([
          db.query.stepAccess.findMany({
            where: eq(stepAccess.participantId, input.participantId),
            with: { step: true },
          }),
          db.query.substepAccess.findMany({
            where: eq(substepAccess.participantId, input.participantId),
            with: { substep: true },
          }),
          db.query.hintAccess.findMany({
            where: eq(hintAccess.participantId, input.participantId),
            with: { hint: true },
          }),
          db.query.solutionAccess.findMany({
            where: eq(solutionAccess.participantId, input.participantId),
            with: { solution: true },
          }),
        ])

        return {
          steps: stepAccessList,
          substeps: substepAccessList,
          hints: hintAccessList,
          solutions: solutionAccessList,
        }
      }),

    // Get workshop content with access filters for a participant
    getWorkshopWithAccess: os
      .input(
        z.object({
          participantId: z.number(),
          workshopId: z.number(),
        }),
      )
      .handler(async ({ input }) => {
        // Get participant access
        const access = await db.query.stepAccess.findMany({
          where: and(
            eq(stepAccess.participantId, input.participantId),
            eq(stepAccess.hasAccess, true),
          ),
          with: { step: true },
        })

        const accessibleStepIds = access.map((a) => a.stepId)

        if (accessibleStepIds.length === 0) {
          return { steps: [] }
        }

        // Get steps with all nested content
        const workshopSteps = await db.query.steps.findMany({
          where: and(
            eq(steps.workshopId, input.workshopId),
            inArray(steps.id, accessibleStepIds),
          ),
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
        })

        // Get access permissions
        const [substepAccessList, hintAccessList, solutionAccessList] =
          await Promise.all([
            db.query.substepAccess.findMany({
              where: and(
                eq(substepAccess.participantId, input.participantId),
                eq(substepAccess.hasAccess, true),
              ),
            }),
            db.query.hintAccess.findMany({
              where: and(
                eq(hintAccess.participantId, input.participantId),
                eq(hintAccess.hasAccess, true),
              ),
            }),
            db.query.solutionAccess.findMany({
              where: and(
                eq(solutionAccess.participantId, input.participantId),
                eq(solutionAccess.hasAccess, true),
              ),
            }),
          ])

        const accessibleSubstepIds = new Set(
          substepAccessList.map((a) => a.substepId),
        )
        const accessibleHintIds = new Set(hintAccessList.map((a) => a.hintId))
        const accessibleSolutionIds = new Set(
          solutionAccessList.map((a) => a.solutionId),
        )

        // Filter content based on access
        const filteredSteps = workshopSteps.map((step) => ({
          ...step,
          substeps: step.substeps
            .filter((substep) => accessibleSubstepIds.has(substep.id))
            .map((substep) => ({
              ...substep,
              hints: substep.hints.filter((hint) =>
                accessibleHintIds.has(hint.id),
              ),
              solutions: substep.solutions.filter((solution) =>
                accessibleSolutionIds.has(solution.id),
              ),
            })),
        }))

        return { steps: filteredSteps }
      }),

    setStepAccessForAllParticipants: os
      .input(
        z.object({
          sessionId: z.number(),
          stepId: z.number(),
          hasAccess: z.boolean(),
        }),
      )
      .handler(async ({ input }) => {
        // Get all participants in the session
        const participants = await db.query.participants.findMany({
          where: eq(participantsTable.sessionId, input.sessionId),
        })

        const results = []
        for (const participant of participants) {
          const existing = await db.query.stepAccess.findFirst({
            where: and(
              eq(stepAccess.participantId, participant.id),
              eq(stepAccess.stepId, input.stepId),
            ),
          })

          if (existing) {
            const [access] = await db
              .update(stepAccess)
              .set({
                hasAccess: input.hasAccess,
                grantedAt: new Date(),
              })
              .where(eq(stepAccess.id, existing.id))
              .returning()
            results.push(access)
          } else {
            const [access] = await db
              .insert(stepAccess)
              .values({
                participantId: participant.id,
                stepId: input.stepId,
                hasAccess: input.hasAccess,
              })
              .returning()
            results.push(access)
          }
        }

        return { count: results.length, results }
      }),

    setSubstepAccessForAllParticipants: os
      .input(
        z.object({
          sessionId: z.number(),
          substepId: z.number(),
          hasAccess: z.boolean(),
        }),
      )
      .handler(async ({ input }) => {
        const participants = await db.query.participants.findMany({
          where: eq(participantsTable.sessionId, input.sessionId),
        })

        const results = []
        for (const participant of participants) {
          const existing = await db.query.substepAccess.findFirst({
            where: and(
              eq(substepAccess.participantId, participant.id),
              eq(substepAccess.substepId, input.substepId),
            ),
          })

          if (existing) {
            const [access] = await db
              .update(substepAccess)
              .set({
                hasAccess: input.hasAccess,
                grantedAt: new Date(),
              })
              .where(eq(substepAccess.id, existing.id))
              .returning()
            results.push(access)
          } else {
            const [access] = await db
              .insert(substepAccess)
              .values({
                participantId: participant.id,
                substepId: input.substepId,
                hasAccess: input.hasAccess,
              })
              .returning()
            results.push(access)
          }
        }

        return { count: results.length, results }
      }),

    setHintAccessForAllParticipants: os
      .input(
        z.object({
          sessionId: z.number(),
          hintId: z.number(),
          hasAccess: z.boolean(),
        }),
      )
      .handler(async ({ input }) => {
        const participants = await db.query.participants.findMany({
          where: eq(participantsTable.sessionId, input.sessionId),
        })

        const results = []
        for (const participant of participants) {
          const existing = await db.query.hintAccess.findFirst({
            where: and(
              eq(hintAccess.participantId, participant.id),
              eq(hintAccess.hintId, input.hintId),
            ),
          })

          if (existing) {
            const [access] = await db
              .update(hintAccess)
              .set({
                hasAccess: input.hasAccess,
                grantedAt: new Date(),
              })
              .where(eq(hintAccess.id, existing.id))
              .returning()
            results.push(access)
          } else {
            const [access] = await db
              .insert(hintAccess)
              .values({
                participantId: participant.id,
                hintId: input.hintId,
                hasAccess: input.hasAccess,
              })
              .returning()
            results.push(access)
          }
        }

        return { count: results.length, results }
      }),

    setSolutionAccessForAllParticipants: os
      .input(
        z.object({
          sessionId: z.number(),
          solutionId: z.number(),
          hasAccess: z.boolean(),
        }),
      )
      .handler(async ({ input }) => {
        const participants = await db.query.participants.findMany({
          where: eq(participantsTable.sessionId, input.sessionId),
        })

        const results = []
        for (const participant of participants) {
          const existing = await db.query.solutionAccess.findFirst({
            where: and(
              eq(solutionAccess.participantId, participant.id),
              eq(solutionAccess.solutionId, input.solutionId),
            ),
          })

          if (existing) {
            const [access] = await db
              .update(solutionAccess)
              .set({
                hasAccess: input.hasAccess,
                grantedAt: new Date(),
              })
              .where(eq(solutionAccess.id, existing.id))
              .returning()
            results.push(access)
          } else {
            const [access] = await db
              .insert(solutionAccess)
              .values({
                participantId: participant.id,
                solutionId: input.solutionId,
                hasAccess: input.hasAccess,
              })
              .returning()
            results.push(access)
          }
        }

        return { count: results.length, results }
      }),

    // Grant all steps to all participants in a session
    grantAllStepsToAllParticipants: os
      .input(
        z.object({
          sessionId: z.number(),
          workshopId: z.number(),
        }),
      )
      .handler(async ({ input }) => {
        const participants = await db.query.participants.findMany({
          where: eq(participantsTable.sessionId, input.sessionId),
        })

        const workshopSteps = await db.query.steps.findMany({
          where: eq(steps.workshopId, input.workshopId),
        })

        let count = 0
        for (const participant of participants) {
          for (const step of workshopSteps) {
            const existing = await db.query.stepAccess.findFirst({
              where: and(
                eq(stepAccess.participantId, participant.id),
                eq(stepAccess.stepId, step.id),
              ),
            })

            if (existing) {
              await db
                .update(stepAccess)
                .set({ hasAccess: true, grantedAt: new Date() })
                .where(eq(stepAccess.id, existing.id))
            } else {
              await db.insert(stepAccess).values({
                participantId: participant.id,
                stepId: step.id,
                hasAccess: true,
              })
            }
            count++
          }
        }

        return {
          count,
          participantsCount: participants.length,
          stepsCount: workshopSteps.length,
        }
      }),
  })

export default router
