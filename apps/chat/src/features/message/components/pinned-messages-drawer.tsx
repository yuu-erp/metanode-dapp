'use client'

import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import MessagePreview from '@/shared/components/message-render/message-preview'
import { useI18N } from '@/shared/hooks'
import { X } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'
import { usePinnedMessages } from '../hooks'

interface PinnedMessagesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account
  conversation?: Conversation
}

export function PinnedMessagesDrawer({
  open,
  onOpenChange,
  account,
  conversation
}: PinnedMessagesDrawerProps) {
  const { t } = useI18N()
  const { data: pinnedMessages = [] } = usePinnedMessages(
    account?.address || '',
    conversation?.conversationId || ''
  )

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none flex flex-col">
          <div className="bg-white rounded-t-xl flex flex-col h-[60vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-lg">{t('pinnedMessages')}</h3>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {pinnedMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  {t('noPinnedMessages')}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pinnedMessages.map((item) => (
                    <div
                      key={item.messageId}
                      className="p-3 bg-gray-50 rounded-lg flex flex-col gap-1 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="text-xs text-gray-400">
                        {new Date(item.pinnedAt).toLocaleDateString()}
                      </div>
                      <MessagePreview
                        message={item.message}
                        className="text-sm text-gray-800 line-clamp-3"
                      />
                    </div>
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
