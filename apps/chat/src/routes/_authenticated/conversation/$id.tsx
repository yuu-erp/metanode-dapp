'use client'
import { ChatHeader, InputMessage, ListMessage } from '@/features/messages'
import { useGetConversationId } from '@/shared/hooks'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/conversation/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authenticated/conversation/$id' })
  const { data: conversation } = useGetConversationId(id)
  // @ts-ignore
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <ChatHeader
        name={conversation?.name}
        type={conversation?.conversationType === 'private' ? 'PRIVATE' : 'USER'}
        username={conversation?.username}
      />
      {/* @ts-ignore */}
      <ListMessage conversation={conversation} />
      {/* Input chat - luôn dính bottom */}
      <InputMessage />
    </div>
  )
}
