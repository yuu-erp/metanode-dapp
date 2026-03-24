'use client'
import type { ConversationType } from '@/modules/conversation'
import { DrawerAddGroupMember } from '@/shared/components'
import AvatarUser from '@/shared/components/avatar-user'
import { VideoIcon } from '@/shared/components/icons'
import TotalUnreadcount from '@/shared/components/total-unreadcount'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { useI18N } from '@/shared/hooks'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft, LoaderCircle } from 'lucide-react'
import * as React from 'react'

interface ChatHeaderProps {
  avatar?: string
  name?: string
  username?: string
  type?: ConversationType
  onVideoCall?: () => void
  isLoading?: boolean
  isAdmin?: boolean
}
function ChatHeader({
  name = '',
  type = 'p2p',
  username,
  onVideoCall,
  isLoading,
  isAdmin
}: ChatHeaderProps) {
  const { t } = useI18N()
  const navigate = useNavigate()

  const isGroup = type === 'group' || type === 'anonymous_group'

  return (
    <WapperHeader alwaysScrolled position="sticky">
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1" onClick={() => navigate({ to: '/' })}>
          <ChevronLeft />
          <TotalUnreadcount variant="secondary" />
        </button>
        <div className="flex flex-1 items-center gap-1 text-left text-sm h-full">
          <AvatarUser size="md" url="" name={name} type={type} />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <div className="text-base font-bold flex-1 line-clamp-1 break-all">
              {type === 'private' ? t(name) : name}
            </div>
            {username && (
              <div className="flex-1 text-xs break-all text-white/60 line-clamp-1">@{username}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* <button>
            <PhoneIcon className="size-7 text-white/80" />
          </button> */}
          {type !== 'private' && (
            <button onClick={onVideoCall} disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="size-6 text-white/80 animate-spin" />
              ) : (
                <VideoIcon className="size-7 text-white/80" />
              )}
            </button>
          )}
          {isGroup && isAdmin && <DrawerAddGroupMember />}
          {/* <button>
            <EllipsisVertical className="size-7 text-white/80" />
          </button> */}
        </div>
      </div>
    </WapperHeader>
  )
}

export default React.memo(ChatHeader)
