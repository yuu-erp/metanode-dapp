import { useGoToMeetingView } from '@/features/meeting'
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
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/p2p/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authenticated/p2p/$id' })
  const { data: account } = useCurrentAccount()
  const { data: conversation } = useGetConversationId(id, 'p2p')
  const viewportHeight = useVisualViewport()
  const isMobile = useIsMobile()

  const containerStyle = useMemo(() => {
    return viewportHeight ? { height: `${viewportHeight}px` } : undefined
  }, [viewportHeight])

  const { mutate: createCall, isPending } = useGoToMeetingView()

  const onVideoCall = () => {
    if (!account || !conversation) throw new Error('[onVideoCall] Invalid input')
    console.log('thanhduy - account', account)
    createCall({
      address: account.address,
      caller: account.address,
      callee: conversation.conversationId,
      isCaller: true,
      isMeet: false,
      hiddenAddress: account.hiddenAddress
    })
  }

  return (
    <MessageActionProvider>
      <CopyMessageActionProvider>
        <div
          className={cn(
            isMobile
              ? 'fixed bottom-0 left-0 right-0 w-full flex flex-col supports-[height:100dvh]:h-[100dvh]'
              : 'relative w-full flex flex-col h-full'
          )}
          style={containerStyle}
        >
          <ChatHeader
            name={conversation?.name}
            type={conversation?.conversationType}
            username={conversation?.username}
            onVideoCall={onVideoCall}
            isLoading={isPending}
          />
          <PinMessages account={account} conversation={conversation as Conversation} />
          <ListMessage conversation={conversation as Conversation} account={account} />
          <InputMessageP2P conversation={conversation as Conversation} account={account} />
        </div>
      </CopyMessageActionProvider>
    </MessageActionProvider>
  )
}
