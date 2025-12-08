import { Separator } from '@/components/ui/separator'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function PageLayout({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

export function PageLayoutTopbar({
  children,
  startActions,
  endActions,
}: {
  startActions?: React.ReactNode
  endActions?: React.ReactNode
  children?: React.ReactNode
}) {
  const { open, isMobile } = useSidebar()

  const showSidebarTrigger = !open || isMobile
  return (
    <div className="flex px-2 items-center h-14 w-full gap-2 border-b border-border">
      {showSidebarTrigger && (
        <>
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className={cn('max-h-6', startActions ? '-mr-1' : 'mr-1')}
          />
        </>
      )}
      {!!startActions && (
        <>
          <div className="flex gap-2 items-center">{startActions}</div>
          <Separator
            orientation="vertical"
            className={cn('max-h-6', { '-ml-1': showSidebarTrigger })}
          />
        </>
      )}
      <div
        className={cn('flex flex-1 items-center', {
          'ml-1': !showSidebarTrigger || startActions,
        })}
      >
        {children}
      </div>
      <div className="ml-auto flex gap-2 items-center">{endActions}</div>
    </div>
  )
}

export function PageLayoutTitle({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <h1 className={cn('text-xl font-bold', className)}>{children}</h1>
}

export function PageLayoutContent({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('container mx-auto p-4', className)}>{children}</div>
  )
}
