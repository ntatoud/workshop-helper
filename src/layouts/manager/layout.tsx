import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ManagerSidebar } from '@/layouts/manager/manager-sidebar'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ManagerSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
