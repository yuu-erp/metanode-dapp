'use client'
import { useCurrentState } from '@/hooks/use-current-state'
import { useCurrentMessageById, usePinnedMessages as usePinned } from '@/new/message'
import { useI18N } from '@/shared/hooks'
import { useUiStore } from '@/stores/ui.store'
import { PinIcon } from 'lucide-react'
import * as React from 'react'
import { PinnedMessagesDrawer } from './pinned-messages-drawer'

interface PinMessagesProps {}

function PinMessages({}: PinMessagesProps) {
  const { t } = useI18N()
  const [openDrawer, setOpenDrawer] = React.useState(false)
  const searchOpen = useUiStore((s) => s.searchOpen)
  const { base } = useCurrentState()
  const { data: pinnedMessage = [] } = usePinned(base)
  const { data: msgData } = useCurrentMessageById(pinnedMessage[pinnedMessage?.length - 1] ?? '')

  if (!pinnedMessage?.length || searchOpen) return null
  return (
    <>
      <div
        onClick={() => setOpenDrawer(true)}
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
