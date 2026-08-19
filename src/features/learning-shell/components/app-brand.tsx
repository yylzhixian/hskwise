import Link from 'next/link'

import { BrandMark } from './brand-mark'

export function AppBrand() {
  return (
    <Link
      aria-label="HSKWise home"
      className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      href="/"
    >
      <BrandMark className="size-8 text-foreground" />
      <span className="text-lg font-semibold tracking-normal">
        HSK<span className="text-focus">Wise</span>
      </span>
    </Link>
  )
}
