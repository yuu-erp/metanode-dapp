import { useStatusStore } from '@app/call'
import { useSendMessageV2 } from '../mesage/use-send-message-v2'

export function useSyncCall() {
  const sendMessage = useSendMessageV2()

  return async ({ id, type }: BaseConversation, payload: any) => {
    if (!id || !type) return
    const pedning = useStatusStore.getState().syncing
    if (pedning) return
    useStatusStore.setState({ syncing: true })
    console.log('thanhduy - useSyncCall', {
      id,
      type,
      payload
    })
    return sendMessage.mutateAsync({
      id: id,
      type: type,
      payload: {
        ...payload,
        type: 'call_status'
      }
    })
  }
}
