'use client'
import { useGetConversations } from '@/features/conversation'
import { useCurrentState } from '@/hooks/use-current-state'
import { type MessageAction } from '@/modules/message'
import { useForwardMessage } from '@/new/message/send-message-v4'
import ConversationContact from '@/shared/components/conversation-contact'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { X } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'

interface ForwardDrawerProps {
  open?: boolean
  onClose?: () => void
  messageAction: MessageAction | null
}
function ForwardDrawer({ open, onClose, messageAction }: ForwardDrawerProps) {
  const { account, base } = useCurrentState()
  const { data: conversations = [] } = useGetConversations(account)
  const isMobile = useIsMobile()
  const { forwardMessage } = useForwardMessage()
  const displayConversations =
    base.type === 'anonymous_group'
      ? conversations.filter((item) => item.conversationId === base.id)
      : conversations

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
            {displayConversations.map((conversation) => (
              <React.Fragment key={conversation.conversationId}>
                <ConversationContact
                  name={conversation.name}
                  username={conversation.username}
                  type={conversation.conversationType}
                  onClick={() =>
                    forwardMessage({
                      messageId: messageAction!.messageId,
                      base: {
                        id: conversation.conversationId,
                        type: conversation.conversationType
                      }
                    })
                  }
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
