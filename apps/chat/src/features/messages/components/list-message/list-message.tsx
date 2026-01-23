'use client'
import type { Message } from '@/modules/message'
import { AnimatePresence } from 'framer-motion'
import * as React from 'react'
import { OverlayMessage } from '../overlay-message'
import ButtonScrollToTop from './button-scroll-to-top'
import type { ListMessageProps } from './list-message-type'
import ListMessageView from './list-message-view'
import { useChatScroll } from './use-chat-scroll'
import { useViewInfiniteScroll } from './use-view-infinite-scroll'

function ListMessage({ conversation, account }: ListMessageProps) {
  // Infinite scroll
  const { messages, isLoading, isError, loadMoreRef, isFetchingNextPage, hasNextPage } =
    useViewInfiniteScroll({ account, conversation })
  // Scroll to bottom
  const { scrollRef, showScrollBottom, scrollToBottom, handleScroll } = useChatScroll()
  // Select message show component OverlayMessage
  const [messageSelect, setMessageSelect] = React.useState<Message | null>(null)
  const handleSelectMessage = React.useCallback(
    (message: Message | null) => setMessageSelect(message),
    []
  )

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex h-full flex-col-reverse overflow-y-auto relative"
      style={{ paddingBottom: 'var(--header-height)' }}
      aria-live="polite"
    >
      <ListMessageView
        messages={messages}
        isLoading={isLoading}
        isError={isError}
        loadMoreRef={loadMoreRef}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        account={account}
        handleSelectMessage={handleSelectMessage}
      />
      {showScrollBottom && <ButtonScrollToTop onClick={scrollToBottom} />}
      <AnimatePresence mode="wait" initial={false}>
        {messageSelect && (
          <OverlayMessage
            message={messageSelect}
            isMine={messageSelect.sender === account?.contractAddress}
            onClose={() => handleSelectMessage(null)}
            conversation={conversation}
            account={account}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default React.memo(ListMessage)
