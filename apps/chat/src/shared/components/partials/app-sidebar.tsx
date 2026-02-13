'use client'

import * as React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '../ui/sidebar'
import StatusSync from '../status-sync'
import { DrawerNewConversation } from '../drawer-new-conversation'
import { ConversationList, SearchConversation } from '@/features/conversation'
import { useI18N } from '@/shared/hooks'
import AccountActivationNotice from '../account-activation-notice'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useI18N()
  const [keyword, setKeyword] = React.useState('')
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
      <SidebarFooter>FOOTER</SidebarFooter>
    </Sidebar>
  )
}
