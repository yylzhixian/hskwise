'use client'

import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { learningScenarioAtom } from '../atoms/learning-selector-atoms'

export function appendFixtureToHref(href: string, fixtureId: string | null) {
  if (!fixtureId) return href

  const url = new URL(href, 'https://hskwise.local')
  url.searchParams.set('fixture', fixtureId)
  return `${url.pathname}${url.search}${url.hash}`
}

export function useLearningScenario() {
  const scenario = useAtomValue(learningScenarioAtom)
  const withFixture = useCallback(
    (href: string) => appendFixtureToHref(href, scenario.fixtureId),
    [scenario.fixtureId],
  )

  return { ...scenario, withFixture }
}
