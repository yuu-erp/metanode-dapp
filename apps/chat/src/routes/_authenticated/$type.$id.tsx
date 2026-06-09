import MessageInput from '@/components/message-input'
import { MessageList } from '@/components/message/message-list'
import { MessageOverlayV2 } from '@/components/message/message-overlay-v2'
import { container } from '@/container'
import {
  ChatHeader,
  CopyMessageActionProvider,
  MessageActionProvider,
  PinMessages
} from '@/features/message'
import { useVisualViewport } from '@/shared/hooks'
import { useGoToMeetingView } from '@/shared/hooks/call/use-go-to-meeting-view'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { formatAddress } from '@/shared/utils'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/$type/$id')({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const { id, type } = params

    if (id.normalize().startsWith('0x')) {
      throw redirect({
        to: '/$type/$id',
        params: {
          id: formatAddress(id),
          type
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
  const viewportHeight = useVisualViewport()
  const isMobile = useIsMobile()

  const containerStyle = useMemo(() => {
    return viewportHeight ? { height: `${viewportHeight}px` } : undefined
  }, [viewportHeight])

  const { onVideoCall, isPending } = useGoToMeetingView()

  return (
    <>
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
            <ChatHeader onVideoCall={onVideoCall} isLoading={isPending} />
            <PinMessages />
            <MessageList />
            <MessageInput />
          </div>
          <MessageOverlayV2 />
        </CopyMessageActionProvider>
      </MessageActionProvider>
    </>
  )
}
