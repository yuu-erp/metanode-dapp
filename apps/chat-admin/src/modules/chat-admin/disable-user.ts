import { methods } from '@/contract'
import { onError } from '@/lib'
import { queryClient, queryKeys } from '@/shared'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useDisableUser(address: string, onSuccess?: () => void) {
  return useMutation({
    mutationFn: async () => {
      await methods.factory.disableUser({
        userToDisable: address
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.isUserDisabled(address) })
    },
    onSuccess: () => {
      toast.success('Disable user successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.isUserDisabled(address) })
      onSuccess?.()
    },
    onError: onError
  })
}
