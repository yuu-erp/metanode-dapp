'use client'

import { useCurrentState } from '@/hooks/use-current-state'
import {
  pinMessage,
  setPinnedMessageState,
  useCurrentMessageById,
  usePinnedMessages
} from '@/new/message'
import { MessagePreview } from '@/shared/components/message-render'
import { useI18N } from '@/shared/hooks'
import { X } from 'lucide-react'
import { Drawer } from 'vaul'

interface PinnedMessagesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PinnedMessagesDrawer({ open, onOpenChange }: PinnedMessagesDrawerProps) {
  const { t } = useI18N()
  const { base } = useCurrentState()
  const { data = [] } = usePinnedMessages(base)

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none flex flex-col">
          <div className="bg-white rounded-t-xl flex flex-col h-[60vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-black font-semibold text-lg">Pinned Messages </h3>
              <div className="flex gap-2 items-center">
                <button
                  onClick={async () => {
                    data.forEach((i) => {
                      setPinnedMessageState(base, i, false)
                      pinMessage(false, i, base)
                    })
                  }}
                  className="text-sm text-gray-500"
                >
                  Unpin All
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="size-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {data.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  {t('noPinnedMessages')}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {data.map((item) => (
                    <PinItem id={item} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 pt-2">
              <div className="sr-only">
                <Drawer.Title>Pinned Messages</Drawer.Title>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

const PinItem = ({ id }: { id: string }) => {
  const { data } = useCurrentMessageById(id)
  if (!data) return null
  return (
    <div className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1 hover:bg-gray-100 transition-colors cursor-pointer">
      {/* <div className="text-xs text-gray-400">
  {new Date(item.pinnedAt).toLocaleDateString()}
</div> */}
      <MessagePreview message={data} className="text-sm text-gray-800 line-clamp-3" />
    </div>
  )
}
