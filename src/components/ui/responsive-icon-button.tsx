import { Fragment } from 'react'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export function ResponsiveIconButton({
  size = 'default',
  children,
  label,
  breakpoint,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size' | 'children'> & {
  children: React.ReactElement<{ children?: React.ReactNode }>
  label: React.ReactNode
  size?: 'sm' | 'default' | 'lg'
  breakpoint?: number
}) {
  const isMobile = useIsMobile()
  const buttonIconSize = match(size)
    .with('default', () => 'icon' as const)
    .with('sm', () => 'icon-sm' as const)
    .with('lg', () => 'icon-lg' as const)
    .exhaustive()
  const buttonSize = isMobile ? buttonIconSize : size

  // Ensure we have only one child when using asChild
  const Wrapper = props.asChild ? 'span' : Fragment
  return (
    <Button size={buttonSize} {...props}>
      <Wrapper>
        {children}
        <span className={cn(isMobile && 'sr-only')}>{label}</span>
      </Wrapper>
    </Button>
  )
}
