'use client'
import {
  ConversationBackgroundSync,
  ConversationList,
  SearchConversation
} from '@/features/conversations'
import AccountActivationNotice from '@/shared/components/account-activation-notice'
import { EditIcon } from '@/shared/components/icons'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { useI18N } from '@/shared/hooks'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createFileRoute('/_authenticated/')({
  component: RouteComponent
})

function RouteComponent() {
  const { t } = useI18N()
  const [keyword, setKeyword] = React.useState('')
  return (
    <div className="w-full h-screen flex flex-col">
      <WapperHeader>
        <div className="flex items-center justify-between gap-3 relative">
          <h1 className="text-xl font-bold">Chats</h1>
          <ConversationBackgroundSync />
          <button>
            <EditIcon className="size-7" />
          </button>
        </div>
        {/* Search nằm trong header nhưng controlled từ Route */}
        <SearchConversation
          placeholder={t('conversationSearch.placeholder')}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <AccountActivationNotice />
      </WapperHeader>
      <div className="flex flex-col w-full relative" style={{ paddingTop: 'var(--header-height)' }}>
        <div className="flex-1 flex flex-col w-full">
          <ConversationList searchKeyword={keyword} />
        </div>
      </div>
    </div>
  )
}
