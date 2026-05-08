import { queryKeys } from '#/shared/ndex'
import { getAllWallets } from '@metanodejs/system-core'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const createAllWalletQuery = () =>
  queryOptions({
    queryKey: queryKeys.wallet.all,
    queryFn: getAllWallets,
    staleTime: 5 * 60 * 1000
  })

export function useAllWallets() {
  return useQuery(createAllWalletQuery())
}
