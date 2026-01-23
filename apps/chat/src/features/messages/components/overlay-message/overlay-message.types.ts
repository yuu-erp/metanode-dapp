import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { Message } from '@/modules/message'

export interface OverlayMessageProps {
  onClose: () => void
  message: Message
  isMine?: boolean
  conversation?: Conversation
  account?: Account
}

export interface OverlayMessageHandlers {
  onReact: (emoji: string) => void
  onReply: () => void
  onCopy: () => void
  onForward: () => void
  onDelete: () => void
}
