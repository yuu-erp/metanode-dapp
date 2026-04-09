'use client'
import type { PersistedMessage } from '@/modules/message'
import { AnimatePresence } from 'framer-motion'
import * as React from 'react'
import { OverlayMessage } from '../overlay-message'
import ButtonScrollToTop from './button-scroll-to-top'
import type { ListMessageProps } from './list-message-type'
import ListMessageView from './list-message-view'
import { useChatScroll } from './use-chat-scroll'
import { useViewInfiniteScroll } from './use-view-infinite-scroll'
import { useMarkAsRead } from '@/shared/hooks'

function ListMessage({ conversation, account }: ListMessageProps) {
  // Infinite scroll
  const { messages, isLoading, isError, loadMoreRef, isFetchingNextPage, hasNextPage } =
    useViewInfiniteScroll({ account, conversation })
  // Scroll to bottom
  const { scrollRef, showScrollBottom, scrollToBottom, handleScroll } = useChatScroll()
  // Select message show component OverlayMessage
  const [messageSelect, setMessageSelect] = React.useState<PersistedMessage | null>(null)
  const handleSelectMessage = React.useCallback(
    (message: PersistedMessage | null) => setMessageSelect(message),
    []
  )
  useMarkAsRead(messages, conversation)

  console.log('thanhduy - messages', messages)
  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-1 min-h-0 flex-col-reverse overflow-y-auto relative"
        // Padding bottom 80px to account for absolute InputMessage
        style={{ paddingBottom: '80px' }}
        aria-live="polite"
      >
        {/* List message */}
        <ListMessageView
          messages={messages}
          isLoading={isLoading}
          isError={isError}
          loadMoreRef={loadMoreRef}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          account={account}
          conversation={conversation}
          // @ts-ignore
          handleSelectMessage={handleSelectMessage}
        />
        {/* Button scroll to top */}
        {showScrollBottom && <ButtonScrollToTop onClick={scrollToBottom} />}
        {/* Overlay message */}
        <AnimatePresence mode="wait" initial={false}>
          {messageSelect && (
            <OverlayMessage
              message={messageSelect}
              onClose={() => handleSelectMessage(null)}
              conversation={conversation}
              account={account}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default React.memo(ListMessage)
