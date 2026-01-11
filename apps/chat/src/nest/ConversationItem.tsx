import { cn } from '@/shared/lib'
import React from 'react'
import { motion } from 'framer-motion'
import { useLongPress } from '@/shared/hooks'
import { sendCommand } from '@metanodejs/system-core'

export interface Conversation {
  id: string
  name: string
  lastMessage: string
}

interface Props {
  conversation: Conversation
  onFocus: (c: Conversation) => void
  onClick?: (c: Conversation) => void
}

export function ConversationItem({ conversation, onFocus, onClick }: Props) {
  const { handlers, isLongPressActive } = useLongPress({
    threshold: 350,
    shouldPreventDefault: true,

    onLongPressStart: () => {
      console.log('Bắt đầu giữ lâu...')
      onFocus(conversation)
      sendCommand('vibrate')
    },

    onLongPressEnd: () => {
      // Optional: nếu cần reset gì đó khi thả tay (thường không cần)
    },

    onClick: (e) => {
      if (onClick) {
        onClick(conversation)
      } else {
        console.log('Mở chat với:', conversation.name)
      }
    }
  })

  return (
    <motion.div
      {...handlers}
      className={cn(
        'relative flex items-center px-3 py-3 rounded-lg cursor-pointer select-none',
        'bg-transparent'
      )}
      // Hiệu ứng nhấn giữ tự động (không cần state)
      whileTap={{
        scale: 0.94,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }}
      whileHover={{
        scale: 1.02,
        backgroundColor: 'rgba(255, 255, 255, 0.05)'
      }}
      transition={{
        type: 'spring',
        stiffness: 300, // tăng lên để phản hồi nhanh
        damping: 20
      }}
      // Không dùng animate để override scale nữa
      // Chỉ dùng isLongPressActive để hiển thị badge (nếu cần)
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{conversation.name}</div>
        <div className="text-sm text-white/60 line-clamp-1">{conversation.lastMessage}</div>
      </div>

      {/* Badge chỉ hiện khi long press đã trigger */}
      {isLongPressActive && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-blue-500/80 px-1.5 py-0.5 rounded">
          Đang chọn...
        </div>
      )}
    </motion.div>
  )
}
