import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { starterRouteId } from '@/learning/routes/content/hsk3-level-1-starter'
import { RouteDetailView } from '@/views/learning/route-detail-view'

export const metadata: Metadata = {
  title: 'Starter foundations',
}

export function generateStaticParams() {
  return [{ routeId: starterRouteId }]
}

export default async function Page({
  params,
}: {
  params: Promise<{ routeId: string }>
}) {
  const { routeId } = await params

  if (routeId !== starterRouteId) notFound()

  return <RouteDetailView />
}
