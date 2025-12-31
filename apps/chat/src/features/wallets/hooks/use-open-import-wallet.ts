'use client'

import { useMutation } from '@tanstack/react-query'

export function useOpenImportWallet() {
  return useMutation({
    mutationFn: async () => {
      // Open import wallet
    },
    onSuccess: () => {
      console.log('✅ Open dapp wallet success!')
    },
    onError: (error) => {
      console.error('❌ Open dapp wallet fail!', error)
    }
  })
}
