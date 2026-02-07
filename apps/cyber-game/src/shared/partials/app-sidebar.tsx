import { MENUS_BY_ROLE } from '@/constants'
import React from 'react'
import Logo from '../components/logo'
import NavItem from '../components/nav-item'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '../components/ui/sidebar'
import { useI18N } from '../hooks'
import { cn } from '../lib/utils'
import type { User } from '../types/user'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User
}
export default function AppSidebar({ user, ...sidebarProps }: AppSidebarProps) {
  const { t } = useI18N()
  const { open } = useSidebar()

  const menus = React.useMemo(() => (user ? MENUS_BY_ROLE[user.role] : []), [user])

  return (
    <Sidebar
      collapsible="icon"
      className="p-0 md:p-2 xl:p-4 border-none bg-transparent"
      {...sidebarProps}
    >
      <div className="flex flex-col w-full h-full rounded-2xl bg-black/40 backdrop-blur-sm-app overflow-hidden">
        <SidebarHeader
          className={cn(
            'flex-row items-center py-2 px-2 xl:py-4 xl:px-6 justify-start',
            open ? 'justify-between' : 'justify-between xl:justify-center'
          )}
        >
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 xl:w-10 xl:h-10" />
            {open && (
              <h1 className="text-lg xl:text-2xl font-bold transition-all duration-300 ease-in-out text-[#FF9D00]">
                Cyber Game
              </h1>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="mt-3 px-2">
          <SidebarMenu className="gap-2 xl:gap-4">
            {menus.map((menu) => (
              <SidebarMenuItem key={menu.path}>
                <NavItem to={menu.path} className="xl:h-[46px]">
                  {({ isActive }) => (
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'rounded-md xl:rounded-2xl hover:bg-white/10',
                        isActive && 'border-app bg-white/10'
                      )}
                    >
                      <div className="flex-row gap-2 xl:h-[46px] xl:px-5">
                        <menu.icon className="xl:!size-6 !size-4" />
                        {open && (
                          <div className="line-clamp-1 flex-1 whitespace-nowrap break-all font-semibold text-xs xl:text-base">
                            {t(menu.labelKey)}
                          </div>
                        )}
                      </div>
                    </SidebarMenuButton>
                  )}
                </NavItem>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </div>
    </Sidebar>
  )
}
