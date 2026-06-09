import { useCurrentState } from '@/hooks/use-current-state'
import { useMessageById } from '@/new/message'
import { useName } from '@/new/user/user-info'
import { cn } from '@/shared/lib'
import { memo } from 'react'
import { MessagePreview } from './message-preview'

export type MessageReplyPreviewProps = {
  data: FulleMessage
}

export const MessageReplyPreview = memo(({ data }: MessageReplyPreviewProps) => {
  const { isMine, replyTo } = data
  const { base } = useCurrentState()
  const { data: repliedMessage } = useMessageById(replyTo!, base)
  const { name } = useName(repliedMessage?.sender)

  return (
    <div
      className={cn(
        'min-h-12 flex items-center gap-2 text-white rounded-md relative mb-1 py-1',
        isMine ? 'bg-blue-700' : 'bg-blue-200'
      )}
      onClick={() => {
        const el = document.querySelector(`[message-id="${replyTo}"]`)
        if (!el) return

        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }}
    >
      <span className="h-full w-[3px] rounded-l-md bg-blue-500 absolute left-0" />

      <div className="h-full flex-1 flex items-center gap-2 px-3">
        <div className="flex-1 overflow-hidden">
          <div
            className={cn(
              'text-sm font-semibold line-clamp-1',
              isMine ? 'text-blue-400' : 'text-[#3b82f6]'
            )}
          >
            Reply to {name}
          </div>
          <MessagePreview id={replyTo} />
        </div>
      </div>
    </div>
  )
})
