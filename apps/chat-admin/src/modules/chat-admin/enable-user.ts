import { methods } from '@/contract'
import { onError } from '@/lib'
import { queryClient, queryKeys } from '@/shared'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useEnableUser(address: string, onSuccess?: () => void) {
  return useMutation({
    mutationFn: async () => {
      await methods.factory.enableUser({
        userToEnable: address
      })
    },
    onSuccess: () => {
      toast.success('Enable user successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.isUserDisabled(address) })
      onSuccess?.()
    },
    onError: onError
  })
}
