'use client'
import AvatarUser from '@/shared/components/avatar-user'
import { PinIcon } from '@/shared/components/icons'
import { Badge } from '@/shared/components/ui/badge'
import { formatUpdatedAt } from '@/shared/helpers'
import { useI18N, useLongPress } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { sendCommand } from '@metanodejs/system-core'
import { Check, CheckCheck, ClockIcon } from 'lucide-react'
import * as React from 'react'

interface ItemConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  avatar?: string
  updatedAt: Date
  lastMessageStatus?: 'sending' | 'sent' | 'delivered' | 'read'
  latestMessageContent?: string
  isPin?: boolean
  type?: 'USER' | 'PRIVATE' | 'GROUP'
  unreadCount?: number
}
function ItemConversation({
  name,
  avatar,
  updatedAt,
  lastMessageStatus,
  latestMessageContent,
  isPin,
  type = 'USER',
  unreadCount = 0,
  className,
  ...props
}: ItemConversationProps) {
  const { t } = useI18N()
  const { handlers, isLongPressActive } = useLongPress({
    threshold: 300,
    shouldPreventDefault: true,
    movementThreshold: 12,
    onLongPressStart: () => {
      console.log('Long press start')
    },
    onLongPressEnd: () => {
      sendCommand('vibrate')
    }
  })

  return (
    <div
      {...handlers}
      className={cn(
        'w-full flex items-center min-h-[56px] h-full',
        'transition-all duration-300 ease-out',
        isLongPressActive && 'bg-black/40',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 text-left text-sm h-full w-full',
          'transition-all duration-300 ease-out',
          isLongPressActive && 'scale-95'
        )}
      >
        <AvatarUser name={name} type={type} />
        <div className="grid flex-1 text-left text-sm leading-tight h-full">
          <div className="w-full flex items-center justify-between gap-3">
            <div className="text-lg font-bold flex-1 line-clamp-1 break-all flex-1">
              {type === 'PRIVATE' ? t(name) : name}
            </div>
            <div className="flex items-center gap-1">
              {lastMessageStatus === 'sending' && <ClockIcon className="size-4" />}
              {lastMessageStatus === 'sent' && <Check className="text-gray-500 size-4" />}
              {lastMessageStatus === 'delivered' && <CheckCheck className="text-gray-500 size-4" />}
              {lastMessageStatus === 'read' && <CheckCheck className="text-green-500 size-4" />}
              <span>{formatUpdatedAt(updatedAt)}</span>
            </div>
          </div>
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex-1 w-full line-clamp-2 text-sm break-all text-white/80 font-medium">
              {latestMessageContent}
            </div>
            {unreadCount > 0 && (
              <Badge
                className="h-5 min-w-5 rounded-full px-1 font-semibold tabular-nums"
                variant="secondary"
              >
                {unreadCount > 999 ? '999+' : unreadCount}
              </Badge>
            )}
            {isPin && <PinIcon className="size-4" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ItemConversation)
