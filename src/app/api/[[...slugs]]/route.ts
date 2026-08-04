import { Elysia } from 'elysia'

export const app = new Elysia({ prefix: '/api' }).get('/health', () => 'ok')

export type App = typeof app

export const GET = app.handle
export const POST = app.handle
export const PUT = app.handle
export const DELETE = app.handle
export const PATCH = app.handle
