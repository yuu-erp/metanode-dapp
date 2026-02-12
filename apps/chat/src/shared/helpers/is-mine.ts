import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { Message } from '@/modules/message'

export function isMine(message: Message, conversation?: Conversation, account?: Account) {
  console.log('thanhduy isMine', { message, account, conversation })
  if (conversation?.conversationType === 'group') {
    return message.sender === account?.address
  }
  return message.sender === account?.contractAddress
}
