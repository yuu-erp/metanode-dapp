'use client'
import { ChatHeader, InputMessage, ListMessage } from '@/features/messages'
import PinMessages from '@/features/messages/components/pin-messages'
import { useCurrentAccount, useGetConversationId } from '@/shared/hooks'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/conversation/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authenticated/conversation/$id' })
  const { data: account } = useCurrentAccount()
  const { data: conversation } = useGetConversationId(id)
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <ChatHeader
        name={conversation?.name}
        type={conversation?.conversationType === 'private' ? 'PRIVATE' : 'USER'}
        username={conversation?.username}
      />
      <PinMessages />
      {/* @ts-ignore */}
      <ListMessage conversation={conversation} account={account} />
      {/* Input chat - luôn dính bottom */}
      {/* @ts-ignore */}
      <InputMessage conversation={conversation} account={account} />
    </div>
  )
}
