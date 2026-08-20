import type { ReactNode } from 'react'

import { AppBrand } from './app-brand'
import {
  LearningAppearanceRoot,
  LearningAppearanceToggle,
} from './learning-appearance'
import { DesktopNavigation, MobileNavigation } from './learning-navigation'

type LearningShellProps = {
  children: ReactNode
}

export function LearningShell({ children }: LearningShellProps) {
  return (
    <LearningAppearanceRoot className="min-h-dvh bg-background text-foreground">
      <a
        className="fixed inset-s-3 top-3 z-50 -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background outline-none transition-transform focus:translate-y-0"
        href="#learning-content"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <AppBrand />
          <div className="flex items-center gap-1">
            <DesktopNavigation />
            <LearningAppearanceToggle />
          </div>
        </div>
      </header>

      <main
        className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
        id="learning-content"
      >
        {children}
      </main>

      <MobileNavigation />
    </LearningAppearanceRoot>
  )
}
