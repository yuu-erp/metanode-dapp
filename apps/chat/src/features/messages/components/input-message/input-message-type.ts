import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { MessageAction } from '../../contexts'

export interface InputMessageProps {
  account?: Account
  conversation?: Conversation
}

export interface InputMessageActionProps {
  messageAction: MessageAction | null
  onClearAction: () => void
}
