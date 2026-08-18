import type { App } from '@/lib/api-app'
import { edenFetch } from '@elysia/eden'

const endpoint = process.env.NEXT_PUBLIC_API_DOMAIN || ''

export const client = edenFetch<App>(endpoint)
