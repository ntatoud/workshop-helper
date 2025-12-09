import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Spinner({
  className,
  full,
  ...props
}: React.ComponentProps<'svg'> & { full?: boolean }) {
  if (full) {
    return (
      <div className="flex flex-1 h-full items-center justify-center">
        <Loader2Icon
          role="status"
          aria-label="Loading"
          className={cn('size-4 animate-spin', className)}
          {...props}
        />
      </div>
    )
  }
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
