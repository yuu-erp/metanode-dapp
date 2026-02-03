'use client'
import {
  ChatHeader,
  CopyMessageActionProvider,
  InputMessage,
  MessageActionProvider
} from '@/features/message'
import { ListMessage } from '@/features/message/components/list-message/index'
import PinMessages from '@/features/message/components/pin-messages'
import type { Conversation } from '@/modules/conversation'
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
    <MessageActionProvider>
      <CopyMessageActionProvider>
        <div className="w-full h-screen flex flex-col">
          <ChatHeader
            name={conversation?.name}
            type={conversation?.conversationType === 'private' ? 'PRIVATE' : 'USER'}
            username={conversation?.username}
          />
          <PinMessages account={account} conversation={conversation as Conversation} />
          <ListMessage conversation={conversation as Conversation} account={account} />
          <InputMessage conversation={conversation as Conversation} account={account} />
        </div>
      </CopyMessageActionProvider>
    </MessageActionProvider>
  )
}
