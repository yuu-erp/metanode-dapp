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
  console.log('addConversationaddConversationaddConversationaddConversation 1')
  const account = await getCurrentAccount()
  await queryClient.ensureQueryData(createGetConversationsQueryOptions(account))
  let { detail, messageId = '' } = options
  if (!detail) {
    console.log('has fetch detail')
    detail = await getConversationDetail(input)
  }
  console.log('input.id', {
    id: input.id,
    detail: detail
  })
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

      const self = old.find((item) => compareAddress(item.conversationId, account.contractAddress))
      const finalOld = self ? old.slice(1) : old
      console.log('finalOld', finalOld)
      const newData = self ? [self, conversation] : [conversation]

      const newArray = isExist
        ? [
            ...newData,
            ...finalOld.filter(
              (item) => !compareAddress(item.conversationId, conversation.conversationId)
            )
          ]
        : [...newData, ...finalOld]
      console.log('newArray', newArray)
      return newArray
    }
  )
}
