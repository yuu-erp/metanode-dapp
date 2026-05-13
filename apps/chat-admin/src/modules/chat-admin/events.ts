import { useEventLog } from '@/hooks/useEventLog'

export function useChatAdminEvents() {
  useEventLog('AdminExecutorAppointed', (e) => {
    console.log('thanhduy - AdminExecutorAppointed', e)
  })
}
