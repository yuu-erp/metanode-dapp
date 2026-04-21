'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query'
import { getAllWallets, getHiddenWallet } from '@metanodejs/system-core'

export function createGetAllWalletsQueryOptions(): UseQueryOptions<
  { address: string }[],
  Error,
  { address: string }[],
  typeof QUERY_KEY.GET_ALL_WALLETS
> {
  return {
    queryKey: QUERY_KEY.GET_ALL_WALLETS,
    queryFn: async (): Promise<{ address: string }[]> => {
      const { address } = await getHiddenWallet()
      const wallets = await getAllWallets()
      return [{ address }, ...wallets.map((item) => ({ address: item.address }))]
    }
  }
}

export function useGetAllWallets() {
  return useQuery(createGetAllWalletsQueryOptions())
}
