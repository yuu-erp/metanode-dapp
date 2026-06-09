import { useEventLog } from '@/shared/hooks/use-event-log'

export function useStatusEvents() {
  useEventLog('ComposingStatusChanged', () => {})
  useEventLog('ComposingStatusChangedGroup', () => {})
  useEventLog('ComposingStatusChanged', () => {})
}
