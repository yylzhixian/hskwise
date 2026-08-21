'use client'

import {
  CheckCircle2Icon,
  MapPinIcon,
  MessageCircleMoreIcon,
} from 'lucide-react'

import type { ActivityRendererProps } from '../model/renderer-contract'
import { VocabularyContextDiscovery } from '@/courses/vocabulary/components/vocabulary-context-discovery'
import { VocabularyWordFocus } from '@/courses/vocabulary/components/vocabulary-word-focus'
import type { LessonActivity } from '@/courses/schema/activities/lesson-activity-schema'

type ContentActivity = Extract<
  LessonActivity,
  { type: 'content-explore/v1' }
>

export function ContentExploreRenderer({
  activity,
  resources,
}: ActivityRendererProps<ContentActivity>) {
  const lexemes = activity.resourceRefs.flatMap((reference) => {
    if (reference.kind !== 'lexeme') return []
    const lexeme = resources.lexemesById[reference.id]
    return lexeme ? [lexeme] : []
  })
  const dialogueRef = activity.resourceRefs.find(
    (reference) => reference.kind === 'dialogue',
  )
  const dialogue = dialogueRef
    ? resources.dialoguesById[dialogueRef.id]
    : undefined

  if (activity.purpose === 'context' && lexemes.length > 0) {
    return <VocabularyContextDiscovery items={lexemes} />
  }
  if (activity.purpose === 'focus' && lexemes.length > 0) {
    return <VocabularyWordFocus items={lexemes} />
  }
  if (activity.purpose === 'summary' && activity.takeaways?.length) {
    return <TakeawayList takeaways={activity.takeaways} />
  }

  return (
    <section className="w-full border-y py-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-focus">
        {dialogue ? <MessageCircleMoreIcon className="size-4" /> : <MapPinIcon className="size-4" />}
        <span>{dialogue ? 'Conversation context' : 'Lesson context'}</span>
      </div>
      {activity.body ? (
        <p className="mt-5 text-xl leading-8 text-balance">{activity.body}</p>
      ) : null}
      {dialogue ? (
        <div className="mt-6 grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-2">
          {dialogue.roles.map((role) => (
            <div className="bg-background px-4 py-3" key={role.id}>
              <p className="font-semibold">{role.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {role.cue ?? role.pinyin}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {activity.takeaways?.length ? (
        <div className="mt-6">
          <TakeawayList takeaways={activity.takeaways} />
        </div>
      ) : null}
    </section>
  )
}

function TakeawayList({ takeaways }: { takeaways: string[] }) {
  return (
    <section className="w-full border-y py-6">
      <ul className="flex flex-col gap-4">
        {takeaways.map((takeaway) => (
          <li className="grid grid-cols-[auto_1fr] gap-3" key={takeaway}>
            <CheckCircle2Icon className="mt-0.5 size-5 text-route-complete-foreground" />
            <span className="leading-7">{takeaway}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
