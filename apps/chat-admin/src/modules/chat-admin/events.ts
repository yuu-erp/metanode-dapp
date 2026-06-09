import { useEventLog } from '@/hooks/useEventLog'

export function useChatAdminEvents() {
  useEventLog('AdminExecutorAppointed', () => {})
}
