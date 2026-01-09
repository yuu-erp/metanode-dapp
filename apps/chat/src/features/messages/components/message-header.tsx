'use client'
import AvatarUser from '@/shared/components/avatar-user'
import { PhoneIcon, VideoIcon } from '@/shared/components/icons'
import TotalUnreadcount from '@/shared/components/total-unreadcount'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import * as React from 'react'

interface ChatHeaderProps {
  avatar?: string
  name?: string
  type?: 'USER' | 'PRIVATE' | 'GROUP'
}
function ChatHeader({ name = '', type = 'USER' }: ChatHeaderProps) {
  const router = useRouter()
  return (
    <WapperHeader alwaysScrolled>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1" onClick={() => router.history.back()}>
          <ChevronLeft />
          <TotalUnreadcount variant="secondary" />
        </button>
        <div className="flex flex-1 items-center gap-2 text-left text-sm h-full">
          <AvatarUser url="" name={name} type={type} className="size-12" />
          <div className="grid flex-1 text-left text-sm leading-tight h-full">
            <div className="text-base font-bold flex-1 line-clamp-1 break-all">{name}</div>
            <div className="flex-1 w-full line-clamp-2 text-xs break-all text-white/60">
              Đang hoạt động
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button>
            <PhoneIcon className="size-8 text-white/80" />
          </button>
          <button>
            <VideoIcon className="size-7 text-white/80" />
          </button>
        </div>
      </div>
    </WapperHeader>
  )
}

export default React.memo(ChatHeader)
