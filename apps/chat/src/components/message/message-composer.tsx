import { useMessageAction } from '@/features/message'
import { useCurrentMessageById } from '@/new/message'
import { useNameBySender } from '@/new/user/user-info'
import { X } from 'lucide-react'
import { memo } from 'react'
import { MessagePreview } from './message-preview'
import { setValue } from '@/stores/input.store'

export type MessageComposerProps = {}

export const MessageComposer = memo(({}: MessageComposerProps) => {
  const { setMessageAction, messageAction } = useMessageAction()

  const { data } = useCurrentMessageById(messageAction?.messageId)
  const onClose = () => {
    setMessageAction(null)
    setValue('', 'chatValue')
  }
  const name = useNameBySender(data?.sender)
  const titles = { EDIT: 'Edit Message', REPLY: `Reply to ${name}` }
  const title = titles[messageAction?.type ?? 'EDIT']

  if (!['EDIT', 'REPLY'].includes(messageAction?.type || '')) return null
  return (
    <div className="h-12 flex items-center gap-2 px-2 text-black">
      <span className="h-full w-[3px] rounded-md bg-blue-500" />

      <div className="h-full flex-1 flex items-center gap-2">
        <div className="flex-1 overflow-hidden">
          <div className="text-base font-medium line-clamp-1 text-blue-400">{title}</div>

          <div className="text-xs font-medium line-clamp-1 break-all">
            <MessagePreview id={messageAction!.messageId} />
          </div>
        </div>

        <X className="shrink-0 size-5 cursor-pointer" onClick={onClose} />
      </div>
    </div>
  )
})
