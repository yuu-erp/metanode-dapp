'use client'
import { useGetConversations } from '@/features/conversation'
import type { Conversation } from '@/modules/conversation'
import ConversationContact from '@/shared/components/conversation-contact'
import { useCurrentAccount } from '@/shared/hooks'
import { useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'
import { useSendMessage } from '../hooks'
import { createForwardPayload, type MessageAction } from '@/modules/message'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'

interface ForwardDrawerProps {
  open?: boolean
  onClose?: () => void
  messageAction: MessageAction | null
}
function ForwardDrawer({ open, onClose, messageAction }: ForwardDrawerProps) {
  const navigate = useNavigate()
  const { data: account } = useCurrentAccount()
  const { data: conversations = [] } = useGetConversations(account?.address)
  const isMobile = useIsMobile()

  const { mutate } = useSendMessage()

  const handleForwardMessage = React.useCallback(
    (conversation: Conversation) => async () => {
      if (!account || !messageAction) return
      if (!messageAction || !messageAction.message || !messageAction.message.id) return
      const forwardPayload = createForwardPayload({
        ...messageAction.message,
        id: messageAction.message.id
      })
      console.log('forwardPayload: ', forwardPayload)
      if (forwardPayload.type === 'text') {
        mutate({
          account,
          conversation,
          payload: {
            type: forwardPayload.type,
            content: messageAction.message.type === 'text' ? messageAction.message.content : '',
            forwardFrom: forwardPayload.forwardFrom
          }
        })
      } else if (forwardPayload.type === 'sticker') {
        mutate({
          account,
          conversation,
          payload: {
            type: forwardPayload.type,
            stickerId:
              messageAction.message.type === 'sticker' ? messageAction.message.stickerId : '',
            forwardFrom: forwardPayload.forwardFrom
          }
        })
      } else if (forwardPayload.type === 'file') {
        const message = messageAction.message
        console.log('message: ', message)
        if (message.type === 'file') {
          mutate({
            account,
            conversation,
            payload: {
              type: 'file',
              fileId: message.fileId,
              fileName: message.fileName,
              mimeType: message.mimeType,
              size: message.size,
              filePath: message.filePath,
              forwardFrom: forwardPayload.forwardFrom
            }
          })
        }
      }
      onClose?.()
      navigate({ to: '/p2p/$id', params: { id: conversation.conversationId } })
    },
    [account, messageAction, mutate, navigate, onClose]
  )

  const renderContent = (
    <div className="relative h-[90vh] md:h-[600px] w-full rounded-t-[36px] md:rounded-2xl bg-black/30 backdrop-blur-lg border border-white/10 flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto w-full flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="w-full banner__overlay--up pt-6 pb-3 flex flex-col gap-5 z-10 shrink-0">
          <div className="w-full h-full flex items-center justify-center relative">
            {isMobile ? (
              <Drawer.Close asChild>
                <button
                  className="
                    absolute left-4
                    size-10 rounded-full
                    bg-[#2c2c2e]
                    border border-white/10
                    shadow-lg
                    flex items-center justify-center
                    transition
                    active:scale-95
                  "
                >
                  <X className="size-5 text-gray-100" />
                </button>
              </Drawer.Close>
            ) : null}

            <span className="text-gray-100 font-semibold text-lg">Forward</span>
          </div>
          {/* Search + QR */}
          <div className="flex items-center gap-2 px-4">
            <input
              type="text"
              placeholder="Search address or username"
              className="
                  flex-1 h-12 rounded-full px-4 text-sm
                  bg-[#2c2c2e]
                  text-gray-100
                  placeholder:text-gray-300
                  border border-white/10
                  outline-none
                  transition
                "
            />
          </div>
        </div>
        <div className="no-scrollbar w-full flex-1 px-4 pb-6 flex flex-col overflow-y-auto">
          {/* List conversation */}
          <div className="flex flex-1 w-full flex-col gap-3 mt-3">
            {conversations.map((conversation) => (
              <React.Fragment key={conversation.conversationId}>
                <ConversationContact
                  name={conversation.name}
                  username={conversation.username}
                  type={conversation.conversationType}
                  onClick={handleForwardMessage(conversation)}
                />
                <div className="h-px bg-white/20 ml-18" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer.Root shouldScaleBackground open={open} onClose={onClose}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 outline-none">
            {renderContent}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose?.()}>
      <DialogContent className="sm:max-w-[425px] p-0 bg-transparent border-none shadow-none text-white">
        {renderContent}
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(ForwardDrawer)
