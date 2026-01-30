import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'

export interface ListMessageProps {
  conversation?: Conversation
  account?: Account
}
