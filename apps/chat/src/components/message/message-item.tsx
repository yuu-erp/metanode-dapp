import { MessageStatusComp } from '@/features/message/components/item-message/message-status'
import { usePlatform } from '@/hooks/core/use-platform'
import { useCurrentMessageById, useIsPinned } from '@/new/message'
import { formatMessageTime } from '@/shared/helpers/date-fns'
import { cn } from '@/shared/lib'
import { modalActions } from '@/stores/modal.store'
import { memo } from 'react'
import { MessageItemContent } from './message-item-content'
import { PinIcon } from 'lucide-react'
import { SmallReactionItem } from './reaction/small-reaction-item'
import { useCurrentState } from '@/hooks/use-current-state'
import { NameOnMessageItem } from './name-on-message-item'
import { MessageReplyPreview } from './message-reply-preview'
import { MessageForwardPreview } from './message-forward-preview'

export type MessageItemProps = {
  id: string
}

export const MessageItem = memo(({ id }: MessageItemProps) => {
  const { data } = useCurrentMessageById(id)
  const { base } = useCurrentState()
  const { isMine, isFailed } = data ?? {}
  const { isMobile } = usePlatform()
  const { isPinned } = useIsPinned(id)
  const isInGroup = ['group', 'anonymous_group'].includes(base.type)

  function openModal(e: any) {
    e.preventDefault()
    e.stopPropagation()
    const event = e?.changedTouches ?? e
    modalActions.setOpen('overlay', { id, x: event.clientX, y: event.clientY })
  }

  const behavior = isMobile ? { onClick: openModal } : { onContextMenu: openModal }

  if (!data) return null
  return (
    <div
      message-id={id}
      className={`flex gap-2 mb-4 ${isMine ? 'justify-end' : 'justify-start'} px-2`}
      {...behavior}
    >
      {/* {isInGroup && <GroupMemberAvatar sender={message.sender} />} */}
      <div
        className={cn(
          'max-w-[70%] min-w-[100px] rounded-2xl px-3 pt-2 pb-1 relative',
          'transition-all duration-300 ease-out',
          // isLongPressActive && 'scale-90',
          isMine
            ? 'bg-blue-600 text-white rounded-br-xs'
            : 'bg-gray-200 text-gray-900 rounded-bl-xs',
          isFailed && 'bg-red-50 text-red-700 border border-red-300'
          // (isSticker || isImage || isVideo) && 'bg-transparent border-none px-0 py-0'
        )}
      >
        {data.replyTo && <MessageReplyPreview data={data} />}
        {data.forwardFrom && <MessageForwardPreview data={data} />}
        {/* <ForwardMessage forwardFrom={message.forwardFrom} isMine={isMine} /> */}
        {isInGroup && !isMine && <NameOnMessageItem data={data} />}
        <MessageItemContent data={data} />
        <div
          className={cn(
            'w-full flex items-end justify-between gap-3'
            // (isImage || isVideo) && 'absolute bottom-1.5 right-1.5'
          )}
        >
          <div className="flex items-center gap-1">
            {data.reactions.map((reaction) => (
              <SmallReactionItem data={reaction} key={reaction.reaction} messageId={data.id} />
            ))}
          </div>
          <div
            className={cn(
              'text-[11px] flex items-center gap-1',
              isMine ? 'text-blue-200' : 'text-gray-500',
              isFailed && 'text-red-500'
            )}
          >
            {isPinned && <PinIcon className="size-3" />}
            {data.isEdited && <span>edited</span>}
            <span>{formatMessageTime(data.timestamp)}</span>
            {isMine && <MessageStatusComp message={data} />}
          </div>
        </div>
      </div>
    </div>
  )
})
