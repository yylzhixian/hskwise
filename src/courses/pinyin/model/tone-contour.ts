import type { PinyinTone } from './pinyin-lesson-schema'

const pitchFrequencies: Record<number, number> = {
  1: 196,
  2: 220,
  3: 247,
  4: 294,
  5: 330,
}

const toneSegmentDurationMs = 800

export type TonePathPoint = {
  x: number
  y: number
}

export function createTonePoints(
  contour: PinyinTone['contour'],
  width = 180,
  height = 72,
): TonePathPoint[] {
  const inset = 8
  const availableWidth = width - inset * 2
  const availableHeight = height - inset * 2

  if (contour.length === 2 && contour[0] === contour[1]) {
    return [
      { x: inset, y: height / 2 },
      { x: width - inset, y: height / 2 },
    ]
  }

  if (contour.length === 3) {
    const shoulderY = inset + availableHeight / 4
    return [
      { x: inset, y: shoulderY },
      { x: width / 2, y: height - inset },
      { x: width - inset, y: shoulderY },
    ]
  }

  return contour.map((level, index) => {
    const x = inset + (availableWidth * index) / (contour.length - 1)
    const y = inset + ((5 - level) / 4) * availableHeight
    return { x, y }
  })
}

export function createTonePath(
  contour: PinyinTone['contour'],
  width = 180,
  height = 72,
) {
  return createTonePoints(contour, width, height)
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ')
}

export function getToneFrequency(level: number) {
  return pitchFrequencies[level] ?? pitchFrequencies[3]
}

export function getTonePlaybackDurationMs(contour: PinyinTone['contour']) {
  return toneSegmentDurationMs * Math.max(1, contour.length - 1)
}
