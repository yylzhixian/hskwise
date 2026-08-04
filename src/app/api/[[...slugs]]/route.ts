import { db } from '@/db'
import { fooTable } from '@/db/schema'
import { Elysia } from 'elysia'

export const app = new Elysia({ prefix: '/api' })
  .get('/health', () => 'ok')
  .get('/db', async () => {
    const result = await db.select().from(fooTable).all()
    return result
  })

export type App = typeof app

export const GET = app.handle
export const POST = app.handle
export const PUT = app.handle
export const DELETE = app.handle
export const PATCH = app.handle
