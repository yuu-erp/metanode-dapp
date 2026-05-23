import { container } from '@/container'
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
import { useGoToMeetingView } from '@/shared/hooks/call/use-go-to-meeting-view'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { formatAddress } from '@/shared/utils'
import { createFileRoute, redirect, useParams } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/p2p/$id')({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const { id } = params

    if (id.normalize().startsWith('0x')) {
      throw redirect({
        to: '/p2p/$id',
        params: {
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
  const { id } = useParams({ from: '/_authenticated/p2p/$id' })
  const { data: account } = useCurrentAccount()
  const { data: conversation } = useGetConversationId(id, 'p2p')
  const viewportHeight = useVisualViewport()
  const isMobile = useIsMobile()

  const containerStyle = useMemo(() => {
    return viewportHeight ? { height: `${viewportHeight}px` } : undefined
  }, [viewportHeight])

  const { onVideoCall, isPending } = useGoToMeetingView()

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
