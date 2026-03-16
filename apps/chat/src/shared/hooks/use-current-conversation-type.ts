import type { ConversationType } from '@/modules/conversation'
import { useSearch } from '@tanstack/react-router'

export function useCurrentConversationType() {
  const search: { type?: ConversationType } = useSearch({ strict: false })
  const conversationType = (search.type?.split('?')[0] ?? 'p2p') as ConversationType
  return conversationType
}
