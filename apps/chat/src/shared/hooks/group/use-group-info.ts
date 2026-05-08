import { useConversationParams } from '../use-conversation-params'
import { useAdmin } from './use-admin'

export function useGroupInfo() {
  const { isAdmin } = useAdmin()
  const { type } = useConversationParams()

  return { isAdmin, isGroup: type === 'group' || type === 'anonymous_group' }
}
