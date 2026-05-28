// ─── Skeleton Components ──────────────────────────────────────────
// Reusable loading placeholders. All are aria-hidden and pulse-animated.
// SkeletonCard mimics the shape of a MentorCard for grid loading states.
// Supports count prop for rendering multiple skeletons at once.

interface SkeletonCardProps {
  /** Number of skeleton cards to render (default: 1) */
  count?: number
  /** Additional CSS classes */
  className?: string
  /** Data test id for the first card (appended with -N for others) */
  'data-testid'?: string
}

export function SkeletonCard({ count = 1, className = '', 'data-testid': testId }: SkeletonCardProps) {
  const cards = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      aria-hidden="true"
      data-testid={testId ? (count === 1 ? testId : `${testId}-${i}`) : undefined}
      className={`w-full min-h-[200px] rounded-none border border-zinc-700 bg-zinc-900/50 p-5 flex flex-col gap-3 animate-pulse ${className}`}
    >
      {/* Card header: face label + suit symbol + personality badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-10 rounded-none bg-zinc-800" />
          <div className="h-5 w-5 rounded-none bg-zinc-800" />
        </div>
        <div className="h-4 w-20 rounded-none bg-zinc-800" />
      </div>

      {/* Name */}
      <div className="h-5 w-3/4 rounded-none bg-zinc-800" />

      {/* Trade */}
      <div className="h-4 w-1/2 rounded-none bg-zinc-800" />

      {/* City, State */}
      <div className="h-3 w-1/3 rounded-none bg-zinc-800" />

      {/* Quote skeleton */}
      <div className="flex-1 border-l-2 border-zinc-800 pl-3 space-y-2">
        <div className="h-3 w-full rounded-none bg-zinc-800" />
        <div className="h-3 w-5/6 rounded-none bg-zinc-800" />
        <div className="h-3 w-2/3 rounded-none bg-zinc-800" />
      </div>
    </div>
  ))

  // When rendering a single card, don't wrap in a fragment wrapper
  // that would break grid layouts; just return the card directly.
  if (count === 1) {
    return cards[0]
  }

  return <>{cards}</>
}

interface SkeletonTextProps {
  /** Number of text skeleton lines */
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`h-4 rounded-none bg-zinc-800 animate-pulse ${className}`}
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </>
  )
}

interface SkeletonCircleProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses: Record<NonNullable<SkeletonCircleProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function SkeletonCircle({ size = 'md', className = '' }: SkeletonCircleProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-none bg-zinc-800 animate-pulse ${sizeClasses[size]} ${className}`.trim()}
    />
  )
}
