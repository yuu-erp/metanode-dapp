import type { Message } from '@/modules/message'
import { useConversationParams } from './use-conversation-params'
import { useGetConversationIdByAddress } from './use-get-conversation-by-address'
import { useGetConversationId } from './use-get-conversation-id'

export function useUserName(message: Message) {
  const user = message.sender
  const { type } = useConversationParams()
  const address = type === 'group' ? user : ''
  const contractAddress = useGetConversationIdByAddress(address, !!address)
  const conversationId = type === 'p2p' ? user : type === 'group' ? (contractAddress ?? '') : ''
  const { data: conversation } = useGetConversationId(conversationId, 'p2p', false)
  const name = type === 'anonymous_group' ? user : (conversation?.name ?? '')

  console.log('thanhduy - useUserName', {
    type,
    address,
    contractAddress,
    conversationId,
    name,
    conversation,
    message
  })

  return name
}
