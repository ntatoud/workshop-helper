import { cva } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 self-center overflow-hidden rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        negative:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-500/25 dark:text-red-100',
        warning:
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-500/25 dark:text-orange-100',
        positive:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-500/25 dark:text-green-100',
        outline: 'text-foreground',
      },
      size: {
        default: '',
        sm: 'px-1.5 py-px text-2xs uppercase',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
