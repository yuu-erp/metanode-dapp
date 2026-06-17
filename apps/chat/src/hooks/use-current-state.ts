import { useCurrentAccount, useGetConversationId } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { compareAddress } from '@/shared/lib'

export function useCurrentState() {
  const { id, type } = useConversationParams()
  const { data: account } = useCurrentAccount()
  const { data: conversation } = useGetConversationId(id, type)
  return {
    account,
    conversation,
    base: { id, type },
    isPrivate: compareAddress(id, account?.contractAddress)
  }
}
