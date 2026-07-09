import { ButtonScrollToTop, useChatScroll } from '@/features/message'
import { useMessaeges } from '@/new/message/list-mesage'
import { LoaderCircle } from 'lucide-react'
import { memo } from 'react'
import { MessageItem } from './message-item'

export type MessageListProps = {}

export const MessageList = memo(({}: MessageListProps) => {
  const { ids, isLoading, isError, loadMoreRef, isFetchingNextPage, hasNextPage } = useMessaeges()
  const { scrollRef, showScrollBottom, scrollToBottom, handleScroll } = useChatScroll()

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex flex-1 min-h-0 flex-col-reverse overflow-y-auto relative"
      // Padding bottom 80px to account for absolute InputMessage
      style={{ paddingBottom: '80px' }}
      aria-live="polite"
    >
      {/* List message */}
      {!isLoading && !isError && ids.map((id) => <MessageItem key={id} id={id} />)}

      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <LoaderCircle className="size-8 animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex h-full items-center justify-center">
          <p className="text-red-500">Lỗi khi tải tin nhắn</p>
        </div>
      )}

      {/* Trigger load more khi scroll lên đầu */}
      <div
        ref={loadMoreRef}
        className="py-4 text-center"
        style={{
          paddingTop: 'calc(var(--header-height) + 30px)'
        }}
      >
        {isFetchingNextPage && (
          <div className="w-full flex items-center justify-center">
            <LoaderCircle className="size-8 animate-spin" />
          </div>
        )}
        {!hasNextPage && ids.length > 0 && (
          <p className="text-sm text-white/60 font-medium">Đã tải hết tin nhắn</p>
        )}
      </div>

      {/* Nếu chưa có tin nhắn nào */}
      {ids.length === 0 && !isFetchingNextPage && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm font-medium">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      )}
      {/* Button scroll to top */}
      {showScrollBottom && <ButtonScrollToTop onClick={scrollToBottom} />}
    </div>
  )
})
