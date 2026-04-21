'use client'

import { container } from '@/container'
import { useMutation } from '@tanstack/react-query'

export function useOpenImportWallet() {
  return useMutation({
    mutationFn: async () => {
      // Open import wallet
      const walletService = container.walletService
      return await walletService.openImportWallet()
    },
    onSuccess: () => {
      console.log('✅ Open dapp wallet success!')
    },
    onError: (error) => {
      console.error('❌ Open dapp wallet fail!', error)
    }
  })
}
