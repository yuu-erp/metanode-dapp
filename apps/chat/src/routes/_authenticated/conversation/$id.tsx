import { ChatHeader, InputChat } from '@/features/chats'
import { useGetConversationId } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/conversation/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authenticated/conversation/$id' })
  const { data: conversation } = useGetConversationId(id)
  console.log('CONVERSATION ID: ', conversation)
  return (
    <div className={cn('w-full h-full flex flex-col')}>
      <ChatHeader
        // avatar={conversation?.avatar}
        name={conversation?.name}
      />
      <InputChat />
    </div>
  )
}
