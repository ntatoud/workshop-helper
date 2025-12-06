import { z } from 'zod'

export type Solution = z.input<ReturnType<typeof zSolution>>
export const zSolution = () =>
  z.object({
    id: z.number(),
    substepId: z.number(),
    content: z.string(),
    explanation: z.string().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })

export type SolutionCreateFormFields = z.input<
  ReturnType<typeof zSolutionCreateFormFields>
>
export const zSolutionCreateFormFields = () =>
  zSolution().pick({
    substepId: true,
    content: true,
    explanation: true,
  })

export type SolutionUpdateFormFields = z.input<
  ReturnType<typeof zSolutionUpdateFormFields>
>
export const zSolutionUpdateFormFields = () =>
  zSolution()
    .pick({
      id: true,
      explanation: true,
    })
    .extend({
      content: zSolution().shape.content.optional(),
    })
