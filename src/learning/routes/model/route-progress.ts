import type { LearningState, ReviewItem } from '@/store/learning/model/learning-state-schema'

import { getRouteNodes, type LearningRoute, type RouteNode } from './route-schema'

export type RouteNodeStatus =
  | 'completed'
  | 'current'
  | 'locked'
  | 'review'

export type RouteNodeView = {
  node: RouteNode
  status: RouteNodeStatus
  isCheckpoint: boolean
}

export type ContinueTarget = {
  kind: 'start' | 'lesson' | 'review' | 'complete'
  label: string
  description: string
  href: string
  nodeId: string | null
}

export type RouteOverview = {
  completedCount: number
  continueTarget: ContinueTarget
  currentNode: RouteNode | null
  isComplete: boolean
  nodeViews: RouteNodeView[]
  progressPercent: number
}

export function getDueReviewItems(
  reviewQueue: ReviewItem[],
  now: string,
): ReviewItem[] {
  const nowMs = Date.parse(now)

  return reviewQueue.filter(
    (item) => item.status === 'queued' && Date.parse(item.dueAt) <= nowMs,
  )
}

export function deriveRouteOverview(
  route: LearningRoute,
  state: LearningState,
  now: string,
): RouteOverview {
  const nodes = getRouteNodes(route)
  const progress = state.routeProgress[route.id]
  const completedNodeIds = new Set(progress?.completedNodeIds ?? [])
  const completedCount = nodes.filter((node) => completedNodeIds.has(node.id)).length
  const firstIncompleteNode =
    nodes.find((node) => !completedNodeIds.has(node.id)) ?? null
  const explicitCurrentNode = nodes.find(
    (node) =>
      node.id === progress?.currentNodeId && !completedNodeIds.has(node.id),
  )
  const currentNode = explicitCurrentNode ?? firstIncompleteNode
  const dueReviews = getDueReviewItems(state.reviewQueue, now)
  const reviewNodeIds = new Set(dueReviews.map((item) => item.sourceNodeId))
  const isComplete = completedCount === nodes.length

  const nodeViews = nodes.map<RouteNodeView>((node) => {
    let status: RouteNodeStatus = 'locked'

    if (reviewNodeIds.has(node.id)) {
      status = 'review'
    } else if (completedNodeIds.has(node.id)) {
      status = 'completed'
    } else if (node.id === currentNode?.id) {
      status = 'current'
    }

    return {
      node,
      status,
      isCheckpoint: node.kind === 'checkpoint',
    }
  })

  const routeHref = `/learn/routes/${route.id}`
  let continueTarget: ContinueTarget

  if (dueReviews.length > 0) {
    continueTarget = {
      kind: 'review',
      label: `Review ${dueReviews.length} due ${dueReviews.length === 1 ? 'item' : 'items'}`,
      description: 'Strengthen the material that is ready for another pass.',
      href: '/learn#review-due',
      nodeId: null,
    }
  } else if (isComplete) {
    continueTarget = {
      kind: 'complete',
      label: 'View route summary',
      description: 'You completed every step in Starter foundations.',
      href: routeHref,
      nodeId: null,
    }
  } else if (currentNode) {
    const isStarted = Boolean(progress?.startedAt || completedCount > 0)
    continueTarget = {
      kind: isStarted ? 'lesson' : 'start',
      label: isStarted ? `Continue: ${currentNode.shortTitle}` : 'Start the route',
      description: currentNode.description,
      href: `/lessons/${currentNode.lessonId}`,
      nodeId: currentNode.id,
    }
  } else {
    continueTarget = {
      kind: 'complete',
      label: 'View route',
      description: route.description,
      href: routeHref,
      nodeId: null,
    }
  }

  return {
    completedCount,
    continueTarget,
    currentNode,
    isComplete,
    nodeViews,
    progressPercent: Math.round((completedCount / nodes.length) * 100),
  }
}
