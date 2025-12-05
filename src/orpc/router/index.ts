// src/orpc/router/index.ts
import { os } from '@orpc/server'
import workshopsRouter from './workshops'
import stepsRouter from './steps'
import substepsRouter from './substeps'
import hintsRouter from './hints'
import solutionsRouter from './solutions'
import sessionsRouter from './sessions'
import participantsRouter from './participants'
import accessRouter from './access'

const router = os.$context<{ headers: Headers }>().prefix('/api').router({
  workshops: workshopsRouter,
  steps: stepsRouter,
  substeps: substepsRouter,
  hints: hintsRouter,
  solutions: solutionsRouter,
  sessions: sessionsRouter,
  participants: participantsRouter,
  access: accessRouter,
})

export default router
