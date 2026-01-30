'use client'

import { Megaphone, QrCode, X } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'

import { EditIcon, UserAddIcon, UserGroupIcon } from '@/shared/components/icons'
import { useCurrentAccount } from '@/shared/hooks'
import { useNavigate } from '@tanstack/react-router'
import { useGetConversations, useScanQrcodeProfile } from '../hooks'
import ConversationContact from '@/shared/components/conversation-contact'

function DrawerNewConversation() {
  const navigate = useNavigate()

  const { data: account } = useCurrentAccount()
  const { data: conversations = [] } = useGetConversations(account?.address)
  const { mutate } = useScanQrcodeProfile()

  const handleClickScanQR = React.useCallback(() => {
    if (!account) return
    mutate(account)
  }, [account, mutate])

  console.log('conversations: ', conversations)

  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>
        <button aria-label="New message">
          <EditIcon className="size-7 text-white" />
        </button>
      </Drawer.Trigger>

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
                    New Message
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

                  <button
                    type="button"
                    onClick={handleClickScanQR}
                    className="
                    size-12 shrink-0 rounded-full
                    bg-[#2c2c2e]
                    border border-white/10
                    shadow-lg
                    flex items-center justify-center
                    transition
                    active:scale-95
                  "
                  >
                    <QrCode className="size-6 text-gray-100" />
                  </button>
                </div>
              </div>
              <div className="no-scrollbar w-full flex-1 px-4 pb-6 flex flex-col overflow-y-auto pt-[130px]">
                {/* Telegram Actions */}
                <div className="flex flex-col">
                  {/* New Group */}
                  <button
                    className="
                    w-full h-12
                    flex items-center gap-4
                    text-left
                    transition
                  "
                  >
                    <UserGroupIcon className="size-6 text-blue-500" />
                    <span className="font-medium text-blue-500">New Group</span>
                  </button>

                  <div className="h-px bg-white/20 ml-10" />

                  {/* New Contact */}
                  <button
                    className="
                    w-full h-12
                    flex items-center gap-4
                    text-left
                    transition
                  "
                  >
                    <UserAddIcon className="size-6 text-blue-500" />
                    <span className="font-medium text-blue-500">New Contact</span>
                  </button>

                  <div className="h-px bg-white/20 ml-10" />

                  {/* New Channel */}
                  <button
                    className="
                    w-full h-14
                    flex items-center gap-4
                    text-left
                    transition
                  "
                  >
                    <Megaphone className="size-5 text-blue-500" />
                    <span className="font-medium text-blue-500">New Channel</span>
                  </button>
                </div>
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
                        onClick={() =>
                          navigate({
                            to: '/conversation/$id',
                            params: { id: conversation.conversationId }
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default React.memo(DrawerNewConversation)
