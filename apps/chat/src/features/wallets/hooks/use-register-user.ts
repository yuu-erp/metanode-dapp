'use client'

import { getSession } from '@/bootstrap'
import { type Wallet } from '@/services/wallets'
import { ACCOUNT_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export function useRegisterUser() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (wallet: Wallet) => {
      if (!wallet || !wallet.address) throw new Error('Wallet not found!')
      const { account } = getSession()
      await account.accountOnboardingService.registerOrLogin(wallet)
      return wallet.address
    },
    onSuccess: (address) => {
      queryClient.removeQueries({
        queryKey: ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
      })
      queryClient.removeQueries({
        queryKey: ACCOUNT_QUERY_KEY.CHECK_USER_CONTRACT(address)
      })
      navigate({ to: '/' })
    },
    onError: (error) => {
      // @ts-ignore
      const messageError = error.message || error.description || 'Connect wallet fail!'
      toast.error(messageError)
    }
  })
}
