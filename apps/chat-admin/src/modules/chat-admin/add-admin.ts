import { methods } from '@/contract'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { addFromQueryData } from './utils'
import { queryKeys } from '@/shared'

export function useAddAdmin(address: string, onSuccess?: () => void) {
  return useMutation({
    mutationFn: async () => {
      await methods.factory.appointAdminExecutor({
        _executor: address
      })
    },
    onSuccess: () => {
      toast.success('Add admin successfully')
      addFromQueryData(queryKeys.admin.allAdmin, 'executors', address)
      onSuccess?.()
    }
  })
}
