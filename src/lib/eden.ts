import { treaty } from '@elysia/eden'
import { app } from '@/app/api/[[...slugs]]/route'

export const api = treaty(app).api
