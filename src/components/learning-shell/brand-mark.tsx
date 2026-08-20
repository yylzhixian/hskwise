type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
    >
      <rect fill="currentColor" height="32" rx="8" width="32" />
      <path
        d="M6.5 10.5h5M14 12.5l4-4M20.5 13l4.5-5M6.5 21.5c1.8-4 3.6-4 5.5-1.5 1.8 2.5 3.6 2.5 5.5-1.5M20.5 18l4.5 5"
        stroke="var(--background)"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  )
}
