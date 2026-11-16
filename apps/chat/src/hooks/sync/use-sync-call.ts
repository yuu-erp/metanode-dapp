import type { ConversationType } from '@/modules/conversation'
import { useStatusStore } from '@app/call'
import { useSendMessage } from '../mesage/use-send-message'

export function useSyncCall() {
  const sendMessage = useSendMessage()

  return async ({ id, type }: BaseConversation, payload: any) => {
    if (!id || !type) return
    const pedning = useStatusStore.getState().syncing
    if (pedning) return
    useStatusStore.setState({ syncing: true })
    console.log('thanhduy - useSyncCall', {
      id,
      type,
      payload,
    })
    return sendMessage.mutateAsync({
      id: id,
      type: type as ConversationType,
      payload: {
        ...payload,
        type: 'call_status',
      },
    })
  }
}
