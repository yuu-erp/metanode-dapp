import { flowActions, useFlowStore } from '@/stores/flow.store'
import { useEffect } from 'react'
import { useSendMessageV2 } from '../mesage/use-send-message-v2'

export function useSyncCall() {
  const { from, to, id, type } = useFlowStore()
  const sendMessage = useSendMessageV2({ id, type })

  useEffect(() => {
    if (!from || !to || !id || !type) return
    const duration = Math.floor((to - from) / 1000) // duration in seconds

    sendMessage
      .mutateAsync({
        type: 'call_duration',
        duration
      })
      .then(() => flowActions.resetCallData())
  }, [])
}
