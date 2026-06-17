import { addConversation } from '@/new/conversation/list-conversation'
import { useEventLog } from '@/shared/hooks/use-event-log'

export function useGroupEvent() {
  useEventLog('GroupJoined', (e) => {
    addConversation({ type: 'group', id: e.groupContractAddress })
  })
}
