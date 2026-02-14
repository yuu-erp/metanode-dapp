'use client'

import { ConversationList, SearchConversation } from '@/features/conversation'
import { useI18N } from '@/shared/hooks'
import { Button } from '@headlessui/react'
import { useNavigate } from '@tanstack/react-router'
import { PhoneIcon, SettingsIcon, UserIcon } from 'lucide-react'
import * as React from 'react'
import AccountActivationNotice from '../account-activation-notice'
import { DrawerNewConversation } from '../drawer-new-conversation'
import { MessageIcon } from '../icons'
import StatusSync from '../status-sync'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '../ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useI18N()
  const [keyword, setKeyword] = React.useState('')
  const navigate = useNavigate()
  return (
    <Sidebar collapsible="icon" className="bg-black/20" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent className="px-3 text-white">
        <div className="flex items-center justify-between gap-3 relative">
          <h1 className="text-xl font-bold">Chats</h1>
          <StatusSync className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <DrawerNewConversation />
        </div>
        <SearchConversation
          placeholder={t('conversationSearch.placeholder')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <AccountActivationNotice />
        <div className="flex-1 flex flex-col w-full pt-3">
          <ConversationList searchKeyword={keyword} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div
          className="h-[84px] w-full bg-black/20 border-app rounded-full"
          style={{
            boxShadow: '4px -4px 16px 0px #FFFFFF2E inset, 0px -2px 16px 0px #FFFFFF85 inset'
          }}
        >
          <div className="h-full w-full flex items-center justify-around px-3">
            <div className="flex flex-col items-center justify-center gap-1">
              <Button
                disabled
                className="size-14 rounded-full bg-black/40 relative flex items-center justify-center disabled:opacity-20"
                style={{
                  boxShadow: `2px 2px 6px 0px #0000004D inset`
                }}
              >
                <UserIcon className="size-8 text-white" />
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <Button
                disabled
                className="size-14 rounded-full bg-black/40 relative flex items-center justify-center disabled:opacity-20"
                style={{
                  boxShadow: `2px 2px 6px 0px #0000004D inset`
                }}
              >
                <PhoneIcon className="size-8 text-white" />
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <Button
                className="size-14 rounded-full bg-black/40 relative flex items-center justify-center"
                style={{
                  boxShadow: `2px 2px 6px 0px #0000004D inset`
                }}
                onClick={() => navigate({ to: '/' })}
              >
                {/* <TotalUnreadc∏ount className="absolute top-1 right-1" variant="destructive" /> */}
                <MessageIcon className="size-8 text-white" />
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <Button
                className="size-14 rounded-full bg-black/40 relative flex items-center justify-center"
                style={{
                  boxShadow: `2px 2px 6px 0px #0000004D inset`
                }}
                onClick={() => navigate({ to: '/settings' })}
              >
                <SettingsIcon className="size-8 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
