import { createGetConversationsQueryOptions } from '@/features/conversation'
import type { Conversation } from '@/modules/conversation'
import { getCurrentAccount } from '@/shared/hooks'
import { compareAddress } from '@/shared/lib'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { getConversationDetail, getConversationKey } from './conversation'

export async function addConversation(
  input: BaseConversation,
  options: { detail?: any; messageId?: string } = {}
) {
  console.log('addConversation 1', { input, options })
  const account = await getCurrentAccount()
  console.log('addConversation 2', { account })

  await queryClient.ensureQueryData(createGetConversationsQueryOptions(account))
  console.log('addConversation 3')

  let { detail, messageId = '' } = options
  if (!detail) {
    console.log('has fetch detail', input)
    detail = await getConversationDetail(input)
  }
  console.log('addConversation 4', { messageId, detail })

  const conversation: Conversation = {
    conversationId: input.id,
    conversationType: input.type as any,
    conversationKey: await getConversationKey(input),
    name: detail.name,
    avatar: detail.avatar,
    accountId: account.address,
    lastMessageId: messageId,
    username: detail.userName
  }

  queryClient.setQueryData(
    CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address),
    (old: Conversation[]) => {
      if (!old) return old
      const isExist = old.some((item) =>
        compareAddress(item.conversationId, conversation.conversationId)
      )
      if (input.id === account.contractAddress) return old
      const self = old.find((item) => compareAddress(item.conversationId, account.contractAddress))
      const finalOld = self ? old.slice(1) : old
      console.log('add test', { isExist: isExist })
      const newData = self ? [self, conversation] : [conversation]

      const newArray = isExist
        ? [
            ...newData,
            ...finalOld.filter(
              (item) => !compareAddress(item.conversationId, conversation.conversationId)
            )
          ]
        : [...newData, ...finalOld]
      return newArray
    }
  )
}
