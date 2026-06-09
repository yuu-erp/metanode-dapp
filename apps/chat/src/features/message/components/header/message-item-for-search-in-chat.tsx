import type { Message } from '@/modules/message'
import AvatarUser from '@/shared/components/avatar-user'
import { TextContentWithMentions } from '@/shared/components/message-render'
import { useScrollToMessageItem } from '@/shared/hooks/use-scroll-to-message-item'
import { useUserName } from '@/shared/hooks/use-user-name'
import { uiActions } from '@/stores/ui.store'
import { memo } from 'react'

export type MessageItemForSearchInChatProps = {
  message: Message
}

export const MessageItemForSearchInChat = memo(({ message }: MessageItemForSearchInChatProps) => {
  const name = useUserName(message)
  const scrollTo = useScrollToMessageItem(message.id ?? '', uiActions.resetSearch)

  if (!name) return null
  return (
    <div className="flex items-center gap-2 py-2" onClick={scrollTo}>
      <AvatarUser size="xs" name={name} type={'p2p'} />
      <div className="flex-1 flex flex-col">
        <p className="text-sm font-bold">{name}</p>
        <p className="text-sm text-gray-300">
          <MessageContent message={message} />
        </p>
      </div>
    </div>
  )
})

export const MessageContent = memo(({ message }: { message: Message }) => {
  if (message.type === 'text') return <TextContentWithMentions text={message.content} />
  if (message.type === 'file') return message.fileName
  return ''
})
