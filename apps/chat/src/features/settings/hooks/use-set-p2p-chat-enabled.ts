'use client'

import { container } from '@/container'
import { useCurrentAccount } from '@/shared/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useSetP2PChatEnabled() {
  const { data: account } = useCurrentAccount()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!account?.address || !account?.contractAddress) throw new Error('Account not found')
      const userContract = container.userContract
      await userContract.setP2PChatEnabled({
        from: account.address,
        to: account.contractAddress,
        // @ts-ignore
        inputData: { enabled: enabled.toString() }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['detailedSettings', account?.address, account?.contractAddress]
      })
    }
  })
}
