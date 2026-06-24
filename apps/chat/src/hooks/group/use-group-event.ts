import { addConversation } from '@/new/conversation/list-conversation'
import { useEventLog } from '@/shared/hooks/use-event-log'

export function useGroupEvent() {
  useEventLog('GroupJoined', (e) => {
    addConversation({ type: 'group', id: e.groupContractAddress })
  })

  useEventLog('JoinCommunityGroup', (e) => {
    addConversation({ type: 'anonymous_group', id: e.group })
  })

  // useEventLog('JoinCommunityGroup', (e) => {
  //   addConversation({ type: 'anonymous_group', id: e.group })
  // })
}
