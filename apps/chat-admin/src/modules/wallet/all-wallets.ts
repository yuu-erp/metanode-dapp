import { queryKeys } from '@/shared'
import { getAllWallets } from '@metanodejs/system-core'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const createAllWalletsQuery = () =>
  queryOptions({
    queryKey: queryKeys.wallet.all,
    staleTime: 1000 * 5 * 60,
    queryFn: getAllWallets
  })

export function useAllWallets() {
  return useQuery(createAllWalletsQuery())
}
