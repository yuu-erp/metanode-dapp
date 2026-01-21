'use client'
import { useGetConversations } from '@/features/conversations'
import ConversationContact from '@/shared/components/conversation-contact'
import { useCurrentAccount } from '@/shared/hooks'
import { X } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'

function ForwardDrawer() {
  const { data: account } = useCurrentAccount()
  const { data: conversations = [] } = useGetConversations(account?.address)
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Portal>
        {/* Overlay */}
        <Drawer.Overlay className="fixed inset-0 bg-black/50" />

        <Drawer.Content className="fixed bottom-0 left-0 right-0 outline-none">
          <div
            className="
              relative
              h-[90vh]
              rounded-t-[36px]
              bg-black/30
              backdrop-blur-md
              border border-white/10
              flex flex-col
              overflow-hidden
            "
          >
            {/* Drag */}

            <div className="max-w-md mx-auto w-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="w-full banner__overlay--up fixed left-0 right-0 top-0 pt-6 pb-3 flex flex-col gap-5 z-10">
                <div className="w-full h-full flex items-center justify-center">
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

                  <Drawer.Title className="text-gray-100 font-semibold text-lg">
                    Forward
                  </Drawer.Title>
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
              <div className="no-scrollbar w-full flex-1 px-4 pb-6 flex flex-col overflow-y-auto pt-[130px]">
                {/* List conversation */}
                <div className="flex flex-1 w-full flex-col gap-3 mt-3">
                  {conversations.map((conversation) => (
                    <React.Fragment key={conversation.conversationId}>
                      <ConversationContact
                        name={conversation.name}
                        username={conversation.username}
                        type={
                          account?.contractAddress === conversation.conversationId
                            ? 'PRIVATE'
                            : 'USER'
                        }
                      />
                      <div className="h-px bg-white/20 ml-18" />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default React.memo(ForwardDrawer)
