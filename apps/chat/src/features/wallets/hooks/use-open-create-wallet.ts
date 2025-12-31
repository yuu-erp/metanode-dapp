'use client'

import { useMutation } from '@tanstack/react-query'

export function useOpenCreateWallet() {
  return useMutation({
    mutationFn: async () => {
      // Open create wallet
    },
    onSuccess: () => {
      console.log('✅ Open dapp wallet success!')
    },
    onError: (error) => {
      console.error('❌ Open dapp wallet fail!', error)
    }
  })
}
