'use client'

import { walletService, type Wallet } from '@/services/wallets'
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
      return await walletService.getAllWallets()
    }
  }
}

export function useGetAllWallets() {
  return useQuery(createGetAllWalletsQueryOptions())
}
