import type { App } from '@/app/api/[[...slugs]]/route'
import { edenFetch } from '@elysia/eden'

const endpoint = process.env.NEXT_PUBLIC_API_DOMAIN || ''

export const client = edenFetch<App>(endpoint)
