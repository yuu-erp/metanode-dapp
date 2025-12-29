'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { formatUpdatedAt, getAvatarFallback, getTelegramGradient } from '@/shared/helpers'
import { cn } from '@/shared/lib'
import { Check, CheckCheck, ClockIcon, Pin } from 'lucide-react'
import * as React from 'react'

interface ItemConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  avatar?: string
  updatedAt: Date
  lastMessageStatus?: 'sending' | 'sent' | 'delivered' | 'read'
  latestMessageContent?: string
  isPin?: boolean
}
function ItemConversation({
  name,
  avatar,
  updatedAt,
  lastMessageStatus,
  latestMessageContent,
  isPin,
  className,
  ...props
}: ItemConversationProps) {
  return (
    <div className={cn('w-full flex items-center min-h-[56px] h-full', className)} {...props}>
      <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm h-full w-full">
        <Avatar className="size-16 rounded-full">
          <AvatarImage src={avatar} alt={`@${name}`} />
          <AvatarFallback
            className="rounded-full text-white text-2xl font-bold"
            style={{
              background: getTelegramGradient(name)
            }}
          >
            {getAvatarFallback(name)}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight h-full">
          <div className="w-full flex items-center justify-between gap-3">
            <div className="text-lg font-bold flex-1 line-clamp-1 break-all flex-1">{name}</div>
            <div className="flex items-center gap-1">
              {lastMessageStatus === 'sending' && <ClockIcon className="size-4" />}
              {lastMessageStatus === 'sent' && <Check className="text-gray-500 size-4" />}
              {lastMessageStatus === 'delivered' && <CheckCheck className="text-gray-500 size-4" />}
              {lastMessageStatus === 'read' && <CheckCheck className="text-green-500 size-4" />}
              <span>{formatUpdatedAt(updatedAt)}</span>
            </div>
          </div>
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex-1 w-full line-clamp-2 text-xs break-all text-white/80">
              {latestMessageContent} Hiểu 👍 Bạn không muốn over-engineering, chỉ cần service
              message đơn giản, đúng mục đích encode + gửi qua SMC, vẫn giữ 3 layer nhưng ít file –
              dễ đọc – dễ maintain.
            </div>
            {isPin && <Pin className="size-4" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ItemConversation)
