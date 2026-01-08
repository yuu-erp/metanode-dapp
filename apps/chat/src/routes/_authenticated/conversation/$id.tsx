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

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <ChatHeader
        name={conversation?.name}
        isPrivate={conversation?.conversationType === 'private'}
      />
      <ListMessage />
      {/* Input chat - luôn dính bottom */}
      <InputMessage />
    </div>
  )
}
