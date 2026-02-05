import {
  ChatHeader,
  CopyMessageActionProvider,
  InputMessageP2P,
  ListMessage,
  MessageActionProvider,
  PinMessages
} from '@/features/message'
import type { Conversation } from '@/modules/conversation'
import { useCurrentAccount, useGetConversationId, useVisualViewport } from '@/shared/hooks'
import { container } from '@/container'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/p2p/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authenticated/p2p/$id' })
  const { data: account } = useCurrentAccount()
  const { data: conversation } = useGetConversationId(id)
  const viewportHeight = useVisualViewport()

  const containerStyle = useMemo(() => {
    return viewportHeight ? { height: `${viewportHeight}px` } : undefined
  }, [viewportHeight])

  const handleVideoCall = useCallback(() => {
    if (!account || !conversation) return
    container.callService.createCall(account, conversation as Conversation).catch(console.error)
  }, [account, conversation])

  return (
    <MessageActionProvider>
      <CopyMessageActionProvider>
        <div
          className="fixed bottom-0 left-0 right-0 w-full flex flex-col supports-[height:100dvh]:h-[100dvh]"
          style={containerStyle}
        >
          <ChatHeader
            name={conversation?.name}
            type={conversation?.conversationType}
            username={conversation?.username}
            onVideoCall={handleVideoCall}
          />
          <PinMessages account={account} conversation={conversation as Conversation} />
          <ListMessage conversation={conversation as Conversation} account={account} />
          <InputMessageP2P conversation={conversation as Conversation} account={account} />
        </div>
      </CopyMessageActionProvider>
    </MessageActionProvider>
  )
}
