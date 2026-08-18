'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import type { LearningRuntimeEvent } from '../scene-schema/runtime-schema'
import { readText } from '../editor/studio-project'
import type { MockReviewItem } from './learning-progress'
import {
  filterRuntimeEvents,
  type RuntimeEventFilter,
} from './runtime-event-utils'

type RuntimeEventPanelProps = {
  events: LearningRuntimeEvent[]
  reviewItems: MockReviewItem[]
  locale: string
}

const eventFilters: Array<{ value: RuntimeEventFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'scene', label: 'Scene' },
  { value: 'answers', label: 'Answers' },
  { value: 'media', label: 'Media' },
  { value: 'custom', label: 'Custom' },
]

export function RuntimeEventPanel({
  events,
  reviewItems,
  locale,
}: RuntimeEventPanelProps) {
  const [filter, setFilter] = useState<RuntimeEventFilter>('all')
  const filteredEvents = useMemo(
    () => filterRuntimeEvents(events, filter),
    [events, filter],
  )

  return (
    <Tabs defaultValue="events" className="min-w-0">
      <TabsList variant="line" className="w-full justify-start">
        <TabsTrigger value="events">
          Events
          <Badge variant="outline">{events.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="review">
          Review
          <Badge variant={reviewItems.length > 0 ? 'destructive' : 'outline'}>
            {reviewItems.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="events" className="min-w-0 pt-2">
        <div className="mb-2 overflow-x-auto pb-1">
          <ToggleGroup
            value={[filter]}
            onValueChange={(values) => {
              const nextFilter = values.at(-1) as RuntimeEventFilter | undefined
              if (nextFilter) setFilter(nextFilter)
            }}
            variant="outline"
            size="sm"
            spacing={0}
            aria-label="Filter learning events"
          >
            {eventFilters.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                aria-label={`Show ${item.label.toLowerCase()} events`}
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {filteredEvents.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">
            {events.length === 0
              ? 'Play the scene or submit an interaction to inspect learning events.'
              : 'No events match this filter.'}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredEvents.map((event) => (
              <div key={event.id} className="rounded-md border border-border p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium">{event.type}</p>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatPlayerTime(event.playheadMs)}
                  </span>
                </div>
                {event.interactionId ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {event.interactionId}
                    {event.attemptNo ? `, attempt ${event.attemptNo}` : ''}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="review" className="pt-2">
        {reviewItems.length === 0 ? (
          <div className="flex items-start gap-2 p-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            No current mistakes in this scene.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {reviewItems.map((item) => (
              <div key={item.id} className="rounded-md border border-border p-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-destructive"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      {item.prompt
                        ? readText(item.prompt, locale)
                        : item.interactionId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.interactionKind}, attempt {item.attempt.attemptNo}
                    </p>
                    {item.knowledgeRefs.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.knowledgeRefs.map((ref) => (
                          <Badge key={ref.id} variant="secondary">
                            {ref.label ? readText(ref.label, locale) : ref.refId}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function formatPlayerTime(timeMs: number) {
  const seconds = Math.max(0, timeMs) / 1000
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${(seconds % 60).toFixed(1).padStart(4, '0')}`
}
