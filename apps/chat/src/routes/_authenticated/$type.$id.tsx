import { container } from '@/container'
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
import { useGoToMeetingView } from '@/shared/hooks/call/use-go-to-meeting-view'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { formatAddress } from '@/shared/utils'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/$type/$id')({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const { id } = params

    if (id.normalize().startsWith('0x')) {
      throw redirect({
        to: '/$type/$id',
        params: {
          ...params,
          id: formatAddress(id)
        }
      })
    }

    const account = await container.accountService.getCurrentAccount()
    if (account) {
      queryClient.invalidateQueries({
        queryKey: MESSAGE_QUERY_KEY.MESSAGES(account?.address, id)
      })
    }
  }
})

function RouteComponent() {
  const { id, type } = useConversationParams()
  const { data: account } = useCurrentAccount()

  const { data: conversation } = useGetConversationId(id, type)
  const viewportHeight = useVisualViewport()
  const isMobile = useIsMobile()
  const containerStyle = useMemo(() => {
    return viewportHeight ? { height: `${viewportHeight}px` } : undefined
  }, [viewportHeight])

  const { mutate: createCall } = useGoToMeetingView()

  const onVideoCall = () => {
    if (!account || !conversation) throw new Error('[onVideoCall] Invalid input')
    createCall({
      address: account.address,
      caller: account.address,
      callee: conversation.conversationId,
      isCaller: true,
      isMeet: true,
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
          />
          <PinMessages account={account} conversation={conversation as Conversation} />
          <ListMessage conversation={conversation as Conversation} account={account} />
          <InputMessageGroup conversation={conversation as Conversation} account={account} />
        </div>
      </CopyMessageActionProvider>
    </MessageActionProvider>
  )
}
