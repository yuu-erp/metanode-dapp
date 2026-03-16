import { container } from '@/container'
import type { Conversation } from '@/modules/conversation'
import type { Message } from '@/modules/message'
import { useEffect, useRef } from 'react'
import { useCurrentAccount } from './use-current-account'
import { asyncPriorityQueue } from '@/modules/realtime'
import { useCurrentConversationType } from './use-current-conversation-type'
import { useQueryClient } from '@tanstack/react-query'
import { CONVERSATION_QUERY_KEY } from '../lib/react-query'

export function useMarkAsRead(messages: Message[], conversation?: Conversation) {
  const { data: account } = useCurrentAccount()
  const type = useCurrentConversationType()
  const read = useRef(new Set<string>())
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!account || !conversation) return
    const unreadMessages = messages
      .filter((m) => m.status !== 'read' && !read.current.has(m.id!))
      .map((i) => i.id)
      .filter((i) => !!i) as string[]
    if (!unreadMessages.length) return
    queryClient.setQueryData(
      CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address),
      (old: Conversation[]) => {
        console.log('thanhduy - conversation old', old)

        return old.map((item) =>
          item.conversationId === conversation.conversationId ? { ...item, unreadCount: 0 } : item
        )
      }
    )
    unreadMessages.forEach((id) => read.current.add(id))

    asyncPriorityQueue.add(async () => {
      if (type === 'p2p') {
        await container.userContract.markMessagesAsRead({
          from: account.address,
          to: account.contractAddress,
          inputData: {
            messageIds: unreadMessages,
            partnerContract: conversation.conversationId
          }
        })
      } else if (type === 'group' || type === 'anonymous_group') {
        const contract =
          type === 'group' ? container.groupContract : container.anonymousGroupContract
        await contract.markMessagesAsRead({
          from: account.address,
          to: conversation.conversationId,
          inputData: { messageIds: unreadMessages }
        })
      }
    }, 'low')
  }, [messages, account?.address, account?.contractAddress, conversation?.conversationId])
}
