'use client'
import type { Message } from '@/modules/message'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import { SmilePlus } from 'lucide-react'
import * as React from 'react'
import { CopyAction, DeleteAction, ForwardAction, ReplyAction } from './menu-context-actions'
import MessageItem from './message-item'
import { useCopyMessageAction, useMessageAction } from '../contexts'

interface OverlayMessageProps {
  onClose: () => void
  message: Message
  isMine?: boolean
}

const quickReactions = ['❤️', '😢', '😂', '👍', '👎', '🔥', '🥰'] // default Telegram

export default React.memo(function OverlayMessage({
  onClose,
  message,
  isMine
}: OverlayMessageProps) {
  const { setMessageAction } = useMessageAction()
  const { copyMessage } = useCopyMessageAction()

  const backdropRef = React.useRef<HTMLDivElement>(null)

  const [open, setOpen] = React.useState(true)

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Chỉ đóng khi click trực tiếp vào backdrop (vùng ngoài cùng)
    if (e.target === backdropRef.current) {
      setOpen(false)
      onClose()
    }
  }

  const handleCloseAction = React.useCallback(() => onClose(), [])

  const handleClickEmoji = React.useCallback((emoji: string) => {
    console.log('HANDLE CLICK EMOJI ------', emoji)
    onClose()
  }, [])

  const handleReplyMessage = React.useCallback(() => {
    setMessageAction({
      type: 'REPLY',
      message
    })
    handleCloseAction()
  }, [message, handleCloseAction])

  const handleCopyMessage = React.useCallback(() => {
    copyMessage(message.type === 'text' ? message.content : '')
    handleCloseAction()
  }, [message, handleCloseAction])

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/60 backdrop-filter-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      {/* Vùng wrapper - không nhận click */}
      <div className="absolute inset-0 max-h-[70vh] flex items-end justify-center overflow-y-auto pointer-events-none">
        {/* Vùng nội dung - bật lại pointer events */}
        <motion.div
          className="w-full max-w-xl"
          initial={{ scale: 0.94, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          <DropdownMenu
            open={open}
            onOpenChange={setOpen}
            modal={false} // Quan trọng khi dùng trong overlay
          >
            <DropdownMenuTrigger asChild>
              <div className="inline-block w-full relative">
                <motion.div
                  className="sticky left-1/8 top-20 w-fit bg-white/80 mb-3 backdrop-blur-md rounded-full px-2 py-1 flex gap-3 shadow-xl pointer-events-auto z-10"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  {quickReactions.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-2xl hover:scale-125 transition-transform"
                      onClick={() => handleClickEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                  <button className="text-black hover:text-white">
                    <SmilePlus className="size-5" />
                  </button>
                </motion.div>
                <MessageItem
                  layoutId={`message-${message.id ?? message.clientId}`}
                  message={message}
                  isMine={isMine}
                />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 mr-2 shadow-xl bg-white/80 backdrop-blur-md border-none rounded-2xl"
              // Ngăn click trong menu lan ra backdrop (tùy chọn, thường không cần)
              onClick={(e) => e.stopPropagation()}
              onCloseAutoFocus={(e) => e.preventDefault()} // ← Ngăn focus quay về trigger khi đóng
              onEscapeKeyDown={(e) => e.preventDefault()} // Optional
            >
              <ReplyAction onClose={handleReplyMessage} />
              <DropdownMenuSeparator className="bg-black/10" />
              <CopyAction onClose={handleCopyMessage} />
              <DropdownMenuSeparator className="bg-black/10" />
              <ForwardAction onClose={handleCloseAction} />
              {isMine && <DeleteAction onClose={handleCloseAction} />}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </motion.div>
  )
})
