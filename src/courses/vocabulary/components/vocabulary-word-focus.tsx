'use client'

import { PlayIcon, Volume2Icon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { useAudioPlayback } from '@/hooks/media/use-audio-playback'

import type { VocabularyItem } from '../model/vocabulary-lesson-schema'

export function VocabularyWordFocus({ items }: { items: VocabularyItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const activeItem = items.find((item) => item.id === activeId) ?? items[0]
  const { audioRef, markEnded, markError, play, status } = useAudioPlayback()

  if (!activeItem) return null

  return (
    <section className="w-full">
      <audio
        onEnded={markEnded}
        onError={markError}
        preload="metadata"
        ref={audioRef}
        src={activeItem.audio.src}
      />

      <ToggleGroup
        aria-label="Vocabulary word rail"
        className="grid w-full grid-cols-2 gap-2 sm:grid-cols-5"
        disabled={status === 'playing'}
        onValueChange={(values) => {
          const nextId = values[0]
          if (nextId) setActiveId(nextId)
        }}
        size="learning"
        value={[activeItem.id]}
        variant="learning"
      >
        {items.map((item, index) => (
          <ToggleGroupItem
            className="min-h-20 flex-col items-start gap-0.5"
            key={item.id}
            value={item.id}
          >
            <span className="text-xs font-normal text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-xl font-semibold">{item.text}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {item.pinyin}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="mt-5 border-y py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-5xl leading-none font-semibold">{activeItem.text}</p>
            <p className="mt-3 text-lg font-medium text-focus">
              {activeItem.pinyin}
            </p>
            <p className="mt-1 text-xl">{activeItem.meaning}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <Badge variant="outline">TTS placeholder</Badge>
            <Button
              className="w-full sm:w-auto"
              disabled={status === 'playing'}
              onClick={() => void play()}
              size="sm"
              variant="outline"
            >
              {status === 'playing' ? (
                <Volume2Icon data-icon="inline-start" />
              ) : (
                <PlayIcon data-icon="inline-start" />
              )}
              {status === 'playing' ? 'Playing word' : 'Play word'}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 border-t pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Sentence job</p>
            <p className="mt-1 leading-7">{activeItem.usageNote}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Where you heard it</p>
            <p className="mt-1 leading-7">{activeItem.source.contextText}</p>
            <p className="text-sm text-muted-foreground">
              {activeItem.source.contextTranslation}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
