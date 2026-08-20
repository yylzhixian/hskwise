'use client'

import {
  CompassIcon,
  ListChecksIcon,
  MapIcon,
  RotateCcwIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navigationItems = [
  { href: '/', label: 'Start', icon: CompassIcon },
  { href: '/learn', label: 'Learn', icon: MapIcon },
  { href: '/review', label: 'Review', icon: RotateCcwIcon },
  { href: '/mistakes', label: 'Mistakes', icon: ListChecksIcon },
] as const

function useLearningNavigation() {
  const pathname = usePathname()

  return navigationItems.map((item) => ({
    ...item,
    isActive:
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
  }))
}

export function DesktopNavigation() {
  const items = useLearningNavigation()

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
      {items.map(({ href, icon: Icon, isActive, label }) => (
        <Link
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'relative flex h-9 items-center gap-2 rounded-sm px-3 text-sm font-medium outline-none transition-colors after:absolute after:inset-x-3 after:-bottom-3.5 after:h-px after:bg-transparent focus-visible:ring-3 focus-visible:ring-ring/30',
            isActive
              ? 'text-focus after:bg-focus'
              : 'text-muted-foreground hover:text-foreground',
          )}
          href={href}
          key={href}
        >
          <Icon aria-hidden="true" className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

export function MobileNavigation() {
  const items = useLearningNavigation()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-4">
        {items.map(({ href, icon: Icon, isActive, label }) => (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[0.6875rem] font-medium outline-none transition-colors before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-transparent focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30 sm:px-3 sm:text-xs sm:before:inset-x-8',
              isActive
                ? 'text-focus before:bg-focus'
                : 'text-muted-foreground hover:text-foreground',
            )}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" className="size-5" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
