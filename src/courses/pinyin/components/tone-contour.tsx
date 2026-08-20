import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import type { PinyinTone } from '../model/pinyin-lesson-schema'
import {
  createTonePath,
  getTonePlaybackDurationMs,
} from '../model/tone-contour'

export function ToneContour({
  active = false,
  className,
  tone,
}: {
  active?: boolean
  className?: string
  tone: PinyinTone
}) {
  const path = createTonePath(tone.contour)
  const animationStyle = {
    '--tone-path-duration': `${getTonePlaybackDurationMs(tone.contour)}ms`,
  } as CSSProperties

  return (
    <svg
      aria-label={`${tone.name}: ${tone.shape}`}
      className={cn('h-auto w-full', className)}
      role="img"
      viewBox="0 0 180 72"
    >
      <g className="stroke-border" strokeWidth="1">
        <path d="M8 8H172" />
        <path d="M8 36H172" />
        <path d="M8 64H172" />
      </g>
      <path
        className={cn(
          'fill-none transition-opacity',
          active ? 'stroke-focus/25' : 'stroke-focus opacity-85',
        )}
        d={path}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {active ? (
        <path
          className="tone-path-draw fill-none stroke-focus"
          d={path}
          pathLength="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          style={animationStyle}
        />
      ) : null}
    </svg>
  )
}
