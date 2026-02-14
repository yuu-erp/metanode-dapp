import {
  ChatHeader,
  CopyMessageActionProvider,
  InputMessageGroup,
  ListMessage,
  MessageActionProvider,
  PinMessages
} from '@/features/message'
import type { Conversation } from '@/modules/conversation'
import { useCurrentAccount, useGetConversationId, useVisualViewport } from '@/shared/hooks'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/group/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authenticated/group/$id' })
  const { data: account } = useCurrentAccount()
  const { data: conversation } = useGetConversationId(id, 'group')
  const viewportHeight = useVisualViewport()

  const containerStyle = useMemo(() => {
    return viewportHeight ? { height: `${viewportHeight}px` } : undefined
  }, [viewportHeight])

  return (
    <MessageActionProvider>
      <CopyMessageActionProvider>
        <div className="relative w-full flex flex-col h-full" style={containerStyle}>
          <ChatHeader
            name={conversation?.name}
            type={conversation?.conversationType}
            username={conversation?.username}
          />
          <PinMessages account={account} conversation={conversation as Conversation} />
          <ListMessage conversation={conversation as Conversation} account={account} />
          <InputMessageGroup conversation={conversation as Conversation} account={account} />
        </div>
      </CopyMessageActionProvider>
    </MessageActionProvider>
  )
}
