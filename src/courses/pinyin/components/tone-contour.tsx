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
  style,
  tone,
}: {
  active?: boolean
  className?: string
  style?: CSSProperties
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
      style={style}
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

export function ToneOptionContour({ tone }: { tone: PinyinTone }) {
  return (
    <span
      className="block flex-none self-stretch overflow-hidden"
      style={{ height: '6rem', width: '100%' }}
    >
      <ToneContour
        className="block"
        style={{ height: '100%', width: '100%' }}
        tone={tone}
      />
    </span>
  )
}
