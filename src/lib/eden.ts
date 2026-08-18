import { treaty } from '@elysia/eden'
import { app } from '@/lib/api-app'

export const api = treaty(app).api
