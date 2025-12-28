'use client'

import { getSession } from '@/bootstrap'
import { useMutation } from '@tanstack/react-query'

export function useOpenCreateWallet() {
  return useMutation({
    mutationFn: async () => {
      const { wallet } = getSession()
      await wallet.walletService.openCreateWallet()
    },
    onSuccess: () => {
      console.log('✅ Open dapp wallet success!')
    },
    onError: (error) => {
      console.error('❌ Open dapp wallet fail!', error)
    }
  })
}
