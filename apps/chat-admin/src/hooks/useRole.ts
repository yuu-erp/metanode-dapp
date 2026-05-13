import { Role } from '@/@types/enum'
import { useFlowStore } from '@/stores/flow.store'

export function useRole() {
  const role = useFlowStore((s) => s.role)

  return {
    isOwner: role === Role.owner,
    isAdmin: role === Role.admin
  }
}
