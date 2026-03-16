import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { PersistedMessage } from '@/modules/message'
import type { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
export interface OverlayMessageProps {
  onClose: () => void
  message: PersistedMessage
  conversation?: Conversation
  account?: Account
}

export interface OverlayMessageHandlers {
  onReact: (emoji: string) => void
  onReply: () => void
  onCopy: () => void
  onForward: () => void
  onDelete: () => void
  onEdit: () => void
  onSave: () => void
  onPin: () => void
}

export interface ActionProps extends React.ComponentProps<typeof DropdownMenuItem> {
  onClose?: () => void
}
