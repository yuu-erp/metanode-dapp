'use client'

import { container } from '@/container'
import { useMutation } from '@tanstack/react-query'

export function useOpenCreateWallet() {
  return useMutation({
    mutationFn: async () => {
      // Open create wallet
      const walletService = container.walletService
      return await walletService.openCreateWallet()
    },
    onSuccess: () => {
      console.log('✅ Open dapp wallet success!')
    },
    onError: (error) => {
      console.error('❌ Open dapp wallet fail!', error)
    }
  })
}
