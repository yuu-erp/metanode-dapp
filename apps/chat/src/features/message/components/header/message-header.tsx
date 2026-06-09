'use client'
import { useCurrentState } from '@/hooks/use-current-state'
import { getGroupName } from '@/new/conversation/group'
import { getUserInfo } from '@/new/user/user-info'
import AvatarUser from '@/shared/components/avatar-user'
import { VideoIcon } from '@/shared/components/icons'
import TotalUnreadcount from '@/shared/components/total-unreadcount'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { useI18N } from '@/shared/hooks'
import { cn } from '@/shared/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft, LoaderCircle } from 'lucide-react'
import * as React from 'react'
import { SearchInChatButton } from '../../../../components/search-in-chat/search-in-chat-button'
import { SearchInChatPopover } from '../../../../components/search-in-chat/search-in-chat-popover'
import { GroupMembers } from './group-members'
import { MoreButton } from './more-button'

interface ChatHeaderProps {
  avatar?: string
  onVideoCall?: () => void
  isLoading?: boolean
}
function ChatHeader({ onVideoCall, isLoading }: ChatHeaderProps) {
  const { t } = useI18N()
  const navigate = useNavigate()
  const { base } = useCurrentState()
  const { type, id } = base
  const [name, setName] = React.useState('')

  React.useEffect(() => {
    if (!id) return
    ;(async () => {
      switch (type) {
        case 'p2p': {
          const rs = (await getUserInfo(id)).firstName
          setName(rs)
          break
        }
        case 'group':
        case 'anonymous_group': {
          setName(await getGroupName(id))

          break
        }
      }
    })()
  }, [id, type])

  return (
    <WapperHeader alwaysScrolled position="sticky" relativeNode={<SearchInChatPopover />}>
      <div className={cn('flex items-center gap-2')}>
        <button className="flex items-center gap-1" onClick={() => navigate({ to: '/' })}>
          <ChevronLeft />
          <TotalUnreadcount variant="secondary" />
        </button>
        <div
          className="flex flex-1 items-center gap-1 text-left text-sm h-full"
          onClick={() =>
            navigate({
              to: '/detail/$type/$id',
              params: { id, type }
            })
          }
        >
          <AvatarUser size="md" url="" name={name} type={type} />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <div className="text-base font-bold flex-1 line-clamp-1 break-all">
              {type === 'private' ? t(name) : name}
            </div>
            {/* {type === 'p2p' && username && (
              <div className="flex-1 text-xs break-all text-white/60 line-clamp-1">@{username}</div>
            )} */}
            {(type === 'group' || type === 'anonymous_group') && <GroupMembers />}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* <button>
            <PhoneIcon className="size-7 text-white/80" />
          </button> */}
          <SearchInChatButton />
          {type !== 'private' && (
            <button onClick={onVideoCall} disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="size-6 text-white/80 animate-spin" />
              ) : (
                <VideoIcon className="size-7 text-white/80" />
              )}
            </button>
          )}
          <MoreButton />
          {/* <button>
            <EllipsisVertical className="size-7 text-white/80" />
          </button> */}
        </div>
      </div>
    </WapperHeader>
  )
}

export default React.memo(ChatHeader)
