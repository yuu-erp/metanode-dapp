'use client'
import { useI18N } from '@/shared/hooks'
import { PinIcon } from 'lucide-react'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import * as React from 'react'
import { usePinnedMessages } from '../hooks'
import MessagePreview from '@/shared/components/message-render/message-preview'

interface PinMessagesProps {
  account?: Account
  conversation?: Conversation
}

function PinMessages({ account, conversation }: PinMessagesProps) {
  const { t } = useI18N()

  const { data: pinnedMessages } = usePinnedMessages(
    account?.address || '',
    conversation?.conversationId || ''
  )

  const pinnedMessage = React.useMemo(() => {
    if (!pinnedMessages || pinnedMessages.length === 0) return null
    return pinnedMessages[0].message
  }, [pinnedMessages])

  if (!pinnedMessage) return null

  return (
    <div
      className="h-14 flex items-center py-2 gap-3 sticky w-full z-10 px-3 bg-white/80 text-black shadow border-app cursor-pointer hover:bg-white/60 transition-colors"
      style={{ top: 'var(--header-height)' }}
    >
      <span className="h-full w-[3px] rounded-md bg-black"></span>
      <div className="h-full flex-1 flex items-center gap-2">
        <div className="flex-1">
          <div className="text-base font-bold flex-1 line-clamp-1 break-all">
            {t('pinnedMessage')}
          </div>
          <div className="flex-1 text-sm font-medium break-all text-black/60 line-clamp-1 break-all">
            {/* {pinnedMessage.type === 'text' ? pinnedMessage.content : `[${pinnedMessage.type}]`} */}
            <MessagePreview message={pinnedMessage} />
          </div>
        </div>
        <PinIcon className="shrink-0 size-5" />
      </div>
    </div>
  )
}

export default React.memo(PinMessages)
