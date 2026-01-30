'use client'

import { container } from '@/container'
import { useBackgroundSyncContext } from '@/shared/background-sync'
import { ACCOUNT_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export function useLogout() {
  const navigate = useNavigate()
  const { clearAllTasks } = useBackgroundSyncContext()
  return useMutation({
    mutationFn: async () => {
      // Logout account
      const accountService = container.accountService
      await accountService.logout()
    },
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
      })
      clearAllTasks()
      navigate({ to: '/wallets' })
    }
  })
}
