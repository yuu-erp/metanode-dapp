import { uiActions } from '@/stores/ui.store'
import { useAdmin } from './use-admin'

export function usePreLeaveGroup() {
  const { isAdmin } = useAdmin()
  return () => {
    if (isAdmin) {
      uiActions.setLeaveGroupOpen(true)
      return false
    } else {
      return true
    }
  }
}
