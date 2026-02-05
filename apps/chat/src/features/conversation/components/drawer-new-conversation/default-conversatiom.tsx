'use client'

import * as React from 'react'
import { HeaderSection } from './sections'
import { Drawer } from 'vaul'
import { Megaphone, QrCode, X } from 'lucide-react'
import type { Conversation } from '@/modules/conversation'
import { UserAddIcon, UserGroupIcon } from '@/shared/components/icons'
import ConversationContact from '@/shared/components/conversation-contact'
import type { Account } from '@/modules/account'
import { useNavigate } from '@tanstack/react-router'
import { useScanQrcodeProfile } from '../../hooks'
import { ScreenType } from './drawer-new-conversation'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'

interface DefaultConversationProps {
  conversations?: Conversation[]
  account?: Account
  onChangeScreenType?: (screenType: ScreenType) => void
}
function DefaultConversation({
  conversations = [],
  account,
  onChangeScreenType
}: DefaultConversationProps) {
  const navigate = useNavigate()

  const { mutate } = useScanQrcodeProfile()

  const handleClickScanQR = React.useCallback(() => {
    if (!account) return
    mutate(account)
  }, [account, mutate])

  return (
    <React.Fragment>
      <HeaderSection>
        <div className="w-full h-full flex items-center justify-center">
          <Drawer.Close asChild>
            <Button className="absolute left-4 size-10 rounded-full bg-[#2c2c2e] border border-white/10 shadow-lg flex items-center justify-center transition active:scale-80">
              <X className="size-5 text-gray-100" />
            </Button>
          </Drawer.Close>

          <Drawer.Title className="text-gray-100 font-semibold text-lg">New Message</Drawer.Title>
        </div>
        {/* Search + QR */}
        <div className="flex items-center gap-2 px-4">
          <Input
            type="text"
            placeholder="Search address or username"
            className="flex-1 h-12 rounded-full px-4 text-sm bg-[#2c2c2e] text-gray-100 placeholder:text-gray-300 border border-white/10 outline-none transition"
          />

          <Button
            type="button"
            onClick={handleClickScanQR}
            className="size-12 shrink-0 rounded-full bg-[#2c2c2e] border border-white/10 shadow-lg flex items-center justify-center transition active:scale-95"
          >
            <QrCode className="size-6 text-gray-100" />
          </Button>
        </div>
      </HeaderSection>
      <div className="no-scrollbar w-full flex-1 px-4 pb-6 flex flex-col overflow-y-auto pt-[130px]">
        {/* Telegram Actions */}
        <div className="flex flex-col">
          {/* New Group */}
          <button
            onClick={() => onChangeScreenType?.(ScreenType.NEW_GROUP)}
            className="w-full h-12 flex items-center gap-4 text-left transition"
          >
            <UserGroupIcon className="size-6 text-blue-500" />
            <span className="font-medium text-blue-500">New Group</span>
          </button>

          <div className="h-px bg-white/20 ml-10" />

          {/* New Contact */}
          <button
            className="w-full h-12 flex items-center gap-4 text-left transition disabled:opacity-50 cursor-not-allowed"
            disabled
          >
            <UserAddIcon className="size-6 text-blue-500" />
            <span className="font-medium text-blue-500">New Contact</span>
          </button>

          <div className="h-px bg-white/20 ml-10" />

          {/* New Channel */}
          <button
            className="w-full h-14 flex items-center gap-4 text-left transition disabled:opacity-50 cursor-not-allowed"
            disabled
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
                type={conversation.conversationType}
                onClick={() =>
                  navigate({
                    to: '/p2p/$id',
                    params: { id: conversation.conversationId }
                  })
                }
              />
              <div className="h-px bg-white/20 ml-18" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(DefaultConversation)
