import { methods } from '@/contract'
import { queryKeys } from '@/shared'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { removeFromQueryData } from './utils'

export function useRemoveAdmin(address: string) {
  return useMutation({
    mutationFn: async () => {
      await methods.factory.revokeAdminExecutor({
        _executor: address
      })
    },
    onSuccess: () => {
      toast.success('Remove admin successfully')
      removeFromQueryData(queryKeys.admin.allAdmin, 'executors', address)
    }
  })
}
