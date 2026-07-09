'use client'
import { useCurrentState } from '@/hooks/use-current-state'
import { createMessageInfoQuery, usePinnedMessages as usePinned } from '@/new/message'
import { useI18N } from '@/shared/hooks'
import { useUiStore } from '@/stores/ui.store'
import { PinIcon } from 'lucide-react'
import * as React from 'react'
import { PinnedMessagesDrawer } from './pinned-messages-drawer'
import { useQueries } from '@tanstack/react-query'

interface PinMessagesProps {}

function PinMessages({}: PinMessagesProps) {
  const { t } = useI18N()
  const [openDrawer, setOpenDrawer] = React.useState(false)
  const searchOpen = useUiStore((s) => s.searchOpen)
  const { base } = useCurrentState()
  const { data: pinnedMessage = [] } = usePinned(base)
  const queries = useQueries({
    queries: pinnedMessage.map((item) => createMessageInfoQuery(item, base))
  })

  const sorted = queries
    .map((item) => item.data)
    .filter(Boolean)
    .sort((a, b) => a!.timestamp - b!.timestamp)
  console.log('sorted', sorted)
  const msgData = sorted[sorted.length - 1]

  console.log('pinnedMessage', pinnedMessage)

  if (!pinnedMessage?.length || searchOpen) return null
  return (
    <>
      <div
        onClick={() => setOpenDrawer(true)}
        className="h-14 flex items-center py-2 gap-3 sticky w-full z-10 px-3 text-black shadow border-app cursor-pointer  transition-colors bg-secondary"
        style={{ top: 'var(--header-height)' }}
      >
        <span className="h-full w-[3px] rounded-md bg-black"></span>
        <div className="h-full flex-1 flex items-center gap-2">
          <div className="flex-1">
            <div className="text-base font-bold flex-1 line-clamp-1 break-all">
              {t('pinnedMessage')}
            </div>
            <div className="flex-1 text-sm font-medium break-all text-black/60 line-clamp-1 break-all">
              {msgData?.type === 'text' ? msgData?.content : `[${msgData?.type}]`}
              {/* <MessagePreview message={pinnedMessage} /> */}
            </div>
          </div>
          <PinIcon className="shrink-0 size-5" />
        </div>
      </div>
      <PinnedMessagesDrawer open={openDrawer} onOpenChange={setOpenDrawer} />
    </>
  )
}

export default React.memo(PinMessages)
