'use client'
import { VerifiedIcon } from '@/assets/icons'
import { MessageStatusComp } from '@/features/message/components/item-message/message-status'
import type { Conversation, ConversationType } from '@/modules/conversation'
import type { Message } from '@/modules/message'
import { useConversationInbox } from '@/new/conversation'
import { useMessageById } from '@/new/message'
import AvatarUser from '@/shared/components/avatar-user'
import { PinIcon } from '@/shared/components/icons'
import { MessagePreview } from '@/shared/components/message-render'
import { Badge } from '@/shared/components/ui/badge'
import { formatUpdatedAt } from '@/shared/helpers'
import { useCurrentAccount, useI18N, useLongPress } from '@/shared/hooks'
import { cn, compareAddress } from '@/shared/lib'
import { sendCommand } from '@metanodejs/system-core'
import { CheckIcon } from 'lucide-react'
import * as React from 'react'
import { ConversationContextMenu } from './conversation-context-menu'

interface ItemConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  avatar?: string
  updatedAt?: Date | number
  lastMessage?: Message
  isPin?: boolean
  type?: ConversationType
  unreadCount?: number
  isMine?: boolean
  isVerified?: boolean
  conversationId?: string
  conversation: Conversation
}
function ItemConversation({
  name,
  avatar,
  updatedAt,
  lastMessage,
  isPin,
  type = 'p2p',
  className,
  isMine = false,
  isVerified,
  conversationId = '',
  conversation,
  ...props
}: ItemConversationProps) {
  const { t } = useI18N()
  const { data: account } = useCurrentAccount()

  const { data: inbox } = useConversationInbox(conversation.conversationId)
  const unreadCount = +(inbox?.unreadCount ?? 0)
  updatedAt = inbox?.lastMessageTimestamp ?? updatedAt

  const base = {
    type: conversation?.conversationType,
    id: conversation?.conversationId
  }

  const { data: lastMesasgeV2 } = useMessageById(inbox?.messageId, base)

  const finalLastMessage = lastMesasgeV2 || lastMessage

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
  // Helper render content
  console.log('is same', compareAddress(conversationId, account?.contractAddress))

  return (
    <ConversationContextMenu conversationId={conversationId} type={type}>
      <div
        {...handlers}
        className={cn(
          'w-full flex items-center min-h-[56px] h-full',
          'transition-all duration-300 ease-out rounded-2xl hover:bg-white',
          // isLongPressActive && 'bg-black/40',
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
          <AvatarUser
            size="lg"
            url={avatar}
            name={name}
            type={type}
            isPrivate={conversation.isPrivate}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <div className="w-full flex items-center justify-between gap-3">
              <div className="text-lg font-bold flex-1 line-clamp-1 break-all flex-1 flex flex-row gap-2 items-center">
                <p>{conversation.isPrivate ? t(name) : name}</p>
                {isVerified && <VerifiedIcon className="size-4" />}
              </div>
              <div className="flex items-center gap-1">
                {!!isMine && <CheckIcon className="size-3" />}
                {!!updatedAt && <span>{formatUpdatedAt(updatedAt as any)}</span>}
              </div>
            </div>
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex-1 w-full line-clamp-2 text-sm break-all font-medium pointer-events-none">
                {/* Priview message */}
                {finalLastMessage && <MessagePreview message={finalLastMessage} />}
              </div>
              {!compareAddress(conversationId, account?.contractAddress) && (
                <>
                  {unreadCount > 0 ? (
                    <Badge
                      className="h-5 min-w-5 rounded-full px-1 font-semibold tabular-nums bg-myapp text-white"
                      variant="secondary"
                    >
                      {unreadCount > 999 ? '999+' : unreadCount}
                    </Badge>
                  ) : finalLastMessage ? (
                    <MessageStatusComp message={finalLastMessage} />
                  ) : null}
                </>
              )}

              {!!isPin && <PinIcon className="size-4" />}
            </div>
          </div>
        </div>
      </div>
    </ConversationContextMenu>
  )
}

export default React.memo(ItemConversation)
