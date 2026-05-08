import { useConversationParams } from '../use-conversation-params'
import { useGetConversationId } from '../use-get-conversation-id'

export function useCurrentConversation() {
  const { id, type } = useConversationParams()

  const { data: conversation } = useGetConversationId(id, type)

  return { conversation }
}
