'use client'

import { CompassIcon, MapIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navigationItems = [
  { href: '/', label: 'Start', icon: CompassIcon },
  { href: '/learn', label: 'Learn', icon: MapIcon },
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
            'flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/30',
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
      className="fixed inset-x-0 bottom-0 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-2">
        {items.map(({ href, icon: Icon, isActive, label }) => (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex min-w-0 flex-col items-center justify-center gap-1 px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/30',
              isActive
                ? 'text-focus'
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
