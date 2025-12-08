import { Link } from '@tanstack/react-router'
import {
  GalleryVerticalEnd,
  HammerIcon,
  HomeIcon,
  RadioIcon,
} from 'lucide-react'
import type { FileRoutesByTo } from '@/routeTree.gen'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const navManagement = [
  {
    title: 'Management',
    items: [
      {
        title: 'Workshops',
        url: '/manager/workshops',
        icon: <HammerIcon />,
      },
      {
        title: 'Sessions',
        url: '/manager/sessions',
        icon: <RadioIcon />,
      },
    ],
  },
] satisfies Array<{
  title: string
  items: Array<{
    title: string
    url: keyof FileRoutesByTo
    icon?: React.ReactNode
  }>
}>

export function ManagerSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <span className="font-medium">Workshop Helper</span>
            </SidebarMenuButton>
            <SidebarMenuAction>
              <SidebarTrigger />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navManagement.map((navItem) => (
          <SidebarGroup key={navItem.title}>
            <SidebarGroupLabel>{navItem.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItem.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link to={item.url}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive}>
                          {item.icon} {item.title}
                        </SidebarMenuButton>
                      )}
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/app">
                  <HomeIcon /> Accueil
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
