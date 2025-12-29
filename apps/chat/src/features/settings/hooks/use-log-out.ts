'use client'

import { getSession } from '@/bootstrap'
import { ACCOUNT_QUERY_KEY, queryClient, SHARED_QUERY_KEY } from '@/shared/lib/react-query'
import { useMutation } from '@tanstack/react-query'

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const { account } = getSession()
      await account.accountService.logout()
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
      })
      queryClient.removeQueries({
        queryKey: SHARED_QUERY_KEY.INIT_PRIVATE_FEATURE
      })
      window.location.reload()
    }
  })
}
