'use client'

import { container } from '@/container'
import type { Wallet } from '@/modules/wallet'
import { SHARED_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function createGetAllWalletsQueryOptions(): UseQueryOptions<
  Wallet[],
  Error,
  Wallet[],
  typeof SHARED_QUERY_KEY.GET_ALL_WALLETS
> {
  return {
    queryKey: SHARED_QUERY_KEY.GET_ALL_WALLETS,
    queryFn: async (): Promise<Wallet[]> => {
      const walletService = container.walletService
      return await walletService.getAllWallets()
    }
  }
}

export function useGetAllWallets() {
  return useQuery(createGetAllWalletsQueryOptions())
}
