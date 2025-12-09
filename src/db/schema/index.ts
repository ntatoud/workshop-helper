import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Workshops table
export const workshops = pgTable('workshops', {
  id: uuid('id').primaryKey().defaultRandom().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Steps table - main steps of a workshop
export const steps = pgTable('steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  workshopId: uuid('workshop_id')
    .notNull()
    .references(() => workshops.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'), // Main content of the step
  order: integer('order').notNull().generatedByDefaultAsIdentity(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Substeps table - substeps within a step
export const substeps = pgTable('substeps', {
  id: uuid('id').primaryKey().defaultRandom(),
  stepId: uuid('step_id')
    .notNull()
    .references(() => steps.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  confirmed: boolean('confirmed').notNull().default(false),
  order: integer('order').notNull().generatedByDefaultAsIdentity(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Hints table - hints for substeps
export const hints = pgTable('hints', {
  id: uuid('id').primaryKey().defaultRandom(),
  substepId: uuid('substep_id')
    .notNull()
    .references(() => substeps.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  order: integer('order').notNull().generatedByDefaultAsIdentity(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Solutions table - solutions for substeps
export const solutions = pgTable('solutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  substepId: uuid('substep_id')
    .notNull()
    .references(() => substeps.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  explanation: text('explanation'), // Optional explanation of the solution
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Sessions table - live workshop sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workshopId: uuid('workshop_id')
    .notNull()
    .references(() => workshops.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g., "Monday Morning Workshop"
  code: varchar('code', { length: 10 }).notNull().unique(), // Unique join code for session
  isActive: boolean('is_active').default(true).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Participants table - users joining sessions
export const participants = pgTable(
  'participants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    // Ensure a name can only join a session once
    uniqueNamePerSession: unique().on(table.sessionId, table.name),
  }),
)

// Access control tables - granular permissions for participants

// Access to steps
export const stepAccess = pgTable(
  'step_access',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participants.id, { onDelete: 'cascade' }),
    stepId: uuid('step_id')
      .notNull()
      .references(() => steps.id, { onDelete: 'cascade' }),
    hasAccess: boolean('has_access').default(false).notNull(),
    grantedAt: timestamp('granted_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueParticipantStep: unique().on(table.participantId, table.stepId),
  }),
)

// Access to substeps
export const substepAccess = pgTable(
  'substep_access',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participants.id, { onDelete: 'cascade' }),
    substepId: uuid('substep_id')
      .notNull()
      .references(() => substeps.id, { onDelete: 'cascade' }),
    hasAccess: boolean('has_access').default(false).notNull(),
    grantedAt: timestamp('granted_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueParticipantSubstep: unique().on(table.participantId, table.substepId),
  }),
)

// Access to hints
export const hintAccess = pgTable(
  'hint_access',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participants.id, { onDelete: 'cascade' }),
    hintId: uuid('hint_id')
      .notNull()
      .references(() => hints.id, { onDelete: 'cascade' }),
    hasAccess: boolean('has_access').default(false).notNull(),
    grantedAt: timestamp('granted_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueParticipantHint: unique().on(table.participantId, table.hintId),
  }),
)

// Access to solutions
export const solutionAccess = pgTable(
  'solution_access',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    participantId: uuid('participant_id')
      .notNull()
      .references(() => participants.id, { onDelete: 'cascade' }),
    solutionId: uuid('solution_id')
      .notNull()
      .references(() => solutions.id, { onDelete: 'cascade' }),
    hasAccess: boolean('has_access').default(false).notNull(),
    grantedAt: timestamp('granted_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueParticipantSolution: unique().on(
      table.participantId,
      table.solutionId,
    ),
  }),
)

// Drizzle ORM Relations
export const workshopsRelations = relations(workshops, ({ many }) => ({
  steps: many(steps),
  sessions: many(sessions),
}))

export const stepsRelations = relations(steps, ({ one, many }) => ({
  workshop: one(workshops, {
    fields: [steps.workshopId],
    references: [workshops.id],
  }),
  substeps: many(substeps),
  access: many(stepAccess),
}))

export const substepsRelations = relations(substeps, ({ one, many }) => ({
  step: one(steps, {
    fields: [substeps.stepId],
    references: [steps.id],
  }),
  hints: many(hints),
  solutions: many(solutions),
  access: many(substepAccess),
}))

export const hintsRelations = relations(hints, ({ one, many }) => ({
  substep: one(substeps, {
    fields: [hints.substepId],
    references: [substeps.id],
  }),
  access: many(hintAccess),
}))

export const solutionsRelations = relations(solutions, ({ one, many }) => ({
  substep: one(substeps, {
    fields: [solutions.substepId],
    references: [substeps.id],
  }),
  access: many(solutionAccess),
}))

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  workshop: one(workshops, {
    fields: [sessions.workshopId],
    references: [workshops.id],
  }),
  participants: many(participants),
}))

export const participantsRelations = relations(
  participants,
  ({ one, many }) => ({
    session: one(sessions, {
      fields: [participants.sessionId],
      references: [sessions.id],
    }),
    stepAccess: many(stepAccess),
    substepAccess: many(substepAccess),
    hintAccess: many(hintAccess),
    solutionAccess: many(solutionAccess),
  }),
)

export const stepAccessRelations = relations(stepAccess, ({ one }) => ({
  participant: one(participants, {
    fields: [stepAccess.participantId],
    references: [participants.id],
  }),
  step: one(steps, {
    fields: [stepAccess.stepId],
    references: [steps.id],
  }),
}))

export const substepAccessRelations = relations(substepAccess, ({ one }) => ({
  participant: one(participants, {
    fields: [substepAccess.participantId],
    references: [participants.id],
  }),
  substep: one(substeps, {
    fields: [substepAccess.substepId],
    references: [substeps.id],
  }),
}))

export const hintAccessRelations = relations(hintAccess, ({ one }) => ({
  participant: one(participants, {
    fields: [hintAccess.participantId],
    references: [participants.id],
  }),
  hint: one(hints, {
    fields: [hintAccess.hintId],
    references: [hints.id],
  }),
}))

export const solutionAccessRelations = relations(solutionAccess, ({ one }) => ({
  participant: one(participants, {
    fields: [solutionAccess.participantId],
    references: [participants.id],
  }),
  solution: one(solutions, {
    fields: [solutionAccess.solutionId],
    references: [solutions.id],
  }),
}))

export * from './auth'
