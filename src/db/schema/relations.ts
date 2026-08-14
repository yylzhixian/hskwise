import { relations } from 'drizzle-orm'

import { authAccounts } from './auth-accounts'
import { learningGoals } from './learning-goals'
import { lexicalForms } from './lexical-forms'
import { lexicalItems } from './lexical-items'
import { userProfiles } from './user-profiles'
import { userSessions } from './user-sessions'
import { users } from './users'

// Relations used by Drizzle query helpers.

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  authAccounts: many(authAccounts),
  sessions: many(userSessions),
  goals: many(learningGoals),
}))

export const authAccountsRelations = relations(authAccounts, ({ one }) => ({
  user: one(users, {
    fields: [authAccounts.userId],
    references: [users.id],
  }),
}))

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}))

export const learningGoalsRelations = relations(learningGoals, ({ one }) => ({
  user: one(users, {
    fields: [learningGoals.userId],
    references: [users.id],
  }),
}))

export const lexicalItemsRelations = relations(lexicalItems, ({ many }) => ({
  forms: many(lexicalForms),
}))

export const lexicalFormsRelations = relations(lexicalForms, ({ one }) => ({
  lexicalItem: one(lexicalItems, {
    fields: [lexicalForms.lexicalItemId],
    references: [lexicalItems.id],
  }),
}))
