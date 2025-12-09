import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import type { Step } from '@/features/step/schema'

/**
 * Utility hook to ensure there is always a step displayed while editing a workshop with non empty steps.
 */
export function useGoToFirstStep(workshopId: string, firstStep?: Step) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const exec = async () => {
      if (
        firstStep &&
        // We are at /manager/workshops/$workshopId/
        location.href.includes('workshops') &&
        !location.href.includes('steps')
      ) {
        await navigate({
          to: '/manager/workshops/$workshopId/steps/$stepId',
          params: {
            stepId: firstStep.id,
            workshopId,
          },
        })
      }
    }

    exec()
  }, [firstStep, workshopId])
}
