'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { SHARED_QUERY_KEY } from '../lib/react-query'
import type { Wallet } from '@/services/wallets'
import { getSession } from '@/bootstrap'

export function createGetAllWalletsQueryOptions(): UseQueryOptions<
  Wallet[],
  Error,
  Wallet[],
  typeof SHARED_QUERY_KEY.GET_ALL_WALLETS
> {
  return {
    queryKey: SHARED_QUERY_KEY.GET_ALL_WALLETS,
    queryFn: async (): Promise<Wallet[]> => {
      const { wallet } = getSession()
      return await wallet.walletService.getAllWallets()
    }
  }
}

export function useGetAllWallets() {
  return useQuery(createGetAllWalletsQueryOptions())
}
