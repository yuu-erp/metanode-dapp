'use client'

import { getAllWallets, type Wallet } from '@metanodejs/system-core'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { SHARED_QUERY_KEY } from '../lib/react-query'

export function createGetAllWalletsQueryOptions(): UseQueryOptions<
  Wallet[],
  Error,
  Wallet[],
  typeof SHARED_QUERY_KEY.GET_ALL_WALLETS
> {
  return {
    queryKey: SHARED_QUERY_KEY.GET_ALL_WALLETS,
    queryFn: async (): Promise<Wallet[]> => {
      return await getAllWallets()
    }
  }
}

export function useGetAllWallets() {
  return useQuery(createGetAllWalletsQueryOptions())
}
