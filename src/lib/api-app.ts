import { Elysia } from 'elysia'

export const app = new Elysia({ prefix: '/api' })
  .get('/health', () => 'ok')
  .get('/db', () => ({
    status: 'configured',
    dialect: 'turso',
    orm: 'drizzle',
  }))

export type App = typeof app
