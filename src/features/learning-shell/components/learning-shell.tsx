import type { ReactNode } from 'react'

import { AppBrand } from './app-brand'
import { DesktopNavigation, MobileNavigation } from './learning-navigation'

type LearningShellProps = {
  children: ReactNode
}

export function LearningShell({ children }: LearningShellProps) {
  return (
    <div className="learning-theme min-h-dvh bg-background text-foreground">
      <a
        className="fixed start-3 top-3 -translate-y-20 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background outline-none transition-transform focus:translate-y-0"
        href="#learning-content"
      >
        Skip to content
      </a>

      <header className="border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <AppBrand />
          <DesktopNavigation />
        </div>
      </header>

      <main
        className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
        id="learning-content"
      >
        {children}
      </main>

      <MobileNavigation />
    </div>
  )
}
