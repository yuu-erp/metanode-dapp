'use client'

import type { Message } from '@/modules/message'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib'
import { motion } from 'framer-motion'
import * as React from 'react'
import { CopyAction, DeleteAction, EditAction, ForwardAction, ReplyAction, SaveAction } from '.'
import { ItemMessage } from '../item-message'
import type { OverlayMessageHandlers } from './overlay-message.types'
import PinAction from './pin.action'

interface OverlayMessageViewProps {
  message: Message
  onClose: () => void
  handlers: OverlayMessageHandlers
  isPinned: boolean
}

const quickReactions = ['❤️', '😢', '😂', '👍', '👎', '🔥', '🥰']

function OverlayMessageView({ message, onClose, handlers, isPinned }: OverlayMessageViewProps) {
  const backdropRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(true)
  const isMine = message.isMine

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      setOpen(false)
      onClose()
    }
  }

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
      <div className="absolute inset-0 max-h-[70vh] flex items-end justify-center overflow-y-auto pointer-events-none pb-5">
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
                  className={cn(
                    'sticky top-20 w-fit bg-white/80 mb-3 backdrop-blur-md-app rounded-full px-2 py-1 flex gap-3 shadow-xl pointer-events-auto z-10',
                    isMine ? 'ml-auto mr-2' : 'ml-2'
                  )}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  {quickReactions.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-2xl hover:scale-125 transition-transform"
                      onClick={() => handlers.onReact(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                  {/* <button className="text-black hover:text-white">
                    <SmilePlus className="size-5" />
                  </button> */}
                </motion.div>
                <ItemMessage
                  layoutId={`message-${message.id ?? message.clientId}`}
                  message={message}
                  isMine={isMine}
                  isOverlay={true}
                />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align={isMine ? 'end' : 'start'}
              className="w-64 ml-2 mr-2 shadow-xl bg-white/80 backdrop-blur-md-app border-none rounded-2xl"
              onClick={(e) => e.stopPropagation()}
              onCloseAutoFocus={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <ReplyAction onClose={handlers.onReply} />
              {message.type === 'text' && (
                <React.Fragment>
                  <DropdownMenuSeparator className="bg-black/10" />
                  <CopyAction onClose={handlers.onCopy} />
                </React.Fragment>
              )}
              {message.type === 'file' && (
                <React.Fragment>
                  <DropdownMenuSeparator className="bg-black/10" />
                  <SaveAction onClose={handlers.onSave} />
                </React.Fragment>
              )}

              {isMine && message.type === 'text' && <EditAction onClose={handlers.onEdit} />}
              <DropdownMenuSeparator className="bg-black/10" />
              <PinAction isPinned={isPinned} onClose={handlers.onPin} />
              {/* <DropdownMenuSeparator className="bg-black/10" /> */}
              <ForwardAction onClose={handlers.onForward} />
              {isMine && <DeleteAction onClose={handlers.onDelete} />}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default React.memo(OverlayMessageView)
