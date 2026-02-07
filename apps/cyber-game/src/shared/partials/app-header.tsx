'use client'

import { Bell, Maximize2, MessageCircle, Minus, ShoppingBag, X } from 'lucide-react'
import { sendCommand } from '@metanodejs/system-core'
import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import type { User } from '@/shared/types/user'

interface AppHeaderProps {
  user?: User
}
export default function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="flex h-12 md:h-14 xl:h-16 shrink-0 items-center justify-between gap-2 px-2 md:px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:border-b md:border-white/10 md:bg-black/40 md:backdrop-blur-sm-app rounded-2xl my-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-7 w-7 md:h-9 md:w-9 border border-blue-500/30">
              <AvatarImage src={user?.avatar} alt={user?.avatar} />
              <AvatarFallback>{user?.avatar?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-black"></div>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium leading-none text-white">
              {user?.name || 'User'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">0x5f...e9bf</div>
          </div>
        </div>
        <div className="hidden md:flex h-9 items-center gap-2 rounded-full bg-white/5 px-4 py-1 border border-white/10">
          <span className="text-sm text-muted-foreground">Số dư còn lại</span>
          <span className="text-sm font-bold text-white">1,200 USDT</span>
          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-black">
            T
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 xl:w-8 xl:h-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 xl:w-8 xl:h-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 xl:w-8 xl:h-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white relative"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-4 md:h-6 bg-white/10 mx-2" />
        {/* Ẩn dưới mobile */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 xl:w-8 xl:h-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
            onClick={() => sendCommand('minimizeWindow')}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 xl:w-8 xl:h-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
            onClick={() => sendCommand('maximizeWindow')}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-7 md:w-7 xl:w-8 xl:h-8 rounded-full hover:bg-red-500/20 text-muted-foreground hover:text-red-500"
            onClick={() => sendCommand('closeWindow')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
