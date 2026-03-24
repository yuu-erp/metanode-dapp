import { useGoToMeetingView } from '@/features/meeting'
import {
  ChatHeader,
  CopyMessageActionProvider,
  InputMessageGroup,
  ListMessage,
  MessageActionProvider,
  PinMessages
} from '@/features/message'
import type { Conversation } from '@/modules/conversation'
import {
  useCurrentAccount,
  useCurrentConversationType,
  useGetConversationId,
  useVisualViewport
} from '@/shared/hooks'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib'
import { formatAddress } from '@/shared/utils'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/$type/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { id } = useParams({ from: '/_authenticated/$type/$id' })
  const { data: account } = useCurrentAccount()
  const type = useCurrentConversationType()

  const { data: conversation } = useGetConversationId(id, type)
  const viewportHeight = useVisualViewport()
  const isMobile = useIsMobile()
  const containerStyle = useMemo(() => {
    return viewportHeight ? { height: `${viewportHeight}px` } : undefined
  }, [viewportHeight])

  console.log('thanhduy - conversation', conversation)
  const { mutate: createCall } = useGoToMeetingView()

  const onVideoCall = () => {
    if (!account || !conversation) throw new Error('[onVideoCall] Invalid input')
    createCall({
      address: account.address,
      caller: account.address,
      callee: conversation.conversationId,
      isCaller: true,
      isMeet: true,
      hiddenAddress: account.hiddenAddress,
      conversationType: conversation.conversationType
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
            onVideoCall={onVideoCall}
            name={conversation?.name}
            type={conversation?.conversationType}
            username={conversation?.name}
            isAdmin={
              formatAddress(conversation?.admin || '') === formatAddress(account?.address || '')
            }
          />
          <PinMessages account={account} conversation={conversation as Conversation} />
          <ListMessage conversation={conversation as Conversation} account={account} />
          <InputMessageGroup conversation={conversation as Conversation} account={account} />
        </div>
      </CopyMessageActionProvider>
    </MessageActionProvider>
  )
}
