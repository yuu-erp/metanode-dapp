'use client'
import { BookmarkIcon, PhoneIcon, VideoIcon } from '@/shared/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { getAvatarFallback, getTelegramGradient } from '@/shared/helpers'
import { useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import * as React from 'react'

interface ChatHeaderProps {
  avatar?: string
  name?: string
  isPrivate?: boolean
}
function ChatHeader({ avatar = '', name = '', isPrivate }: ChatHeaderProps) {
  const router = useRouter()
  return (
    <WapperHeader alwaysScrolled>
      <div className="flex items-center gap-2">
        <button onClick={() => router.history.back()}>
          <ChevronLeft />
        </button>
        <div className="flex flex-1 items-center gap-2 text-left text-sm h-full">
          <Avatar className="size-11 rounded-full">
            <AvatarImage src={avatar} alt={`@${name}`} />
            <AvatarFallback
              className="rounded-full text-white text-lg font-bold"
              style={{
                background: isPrivate
                  ? 'linear-gradient(135deg, rgb(102, 95, 255), rgb(130, 177, 255))'
                  : getTelegramGradient(name)
              }}
            >
              {isPrivate ? <BookmarkIcon className="size-6 text-white" /> : getAvatarFallback(name)}
            </AvatarFallback>
          </Avatar>
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
