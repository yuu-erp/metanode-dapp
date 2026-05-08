import { leaveGroupActions } from '@/stores'
import { useAdmin } from './use-admin'

export function usePreLeaveGroup() {
  const { isAdmin } = useAdmin()
  return () => {
    if (isAdmin) {
      leaveGroupActions.setIsLeaveGroup(true)
      return false
    } else {
      return true
    }
  }
}
