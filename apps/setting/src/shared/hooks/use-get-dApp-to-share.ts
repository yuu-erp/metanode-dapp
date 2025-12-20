'use client'

import type { Dapp } from '@/interfaces/dapp.interface'
import { getDAppToShare } from '@metanodejs/system-core'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query/query-key'

export type GetGetDAppToShareData = Dapp[]
export type GetGetDAppToShareError = Error

export function createGetDAppToShareQueryOptions(): UseQueryOptions<
  GetGetDAppToShareData,
  GetGetDAppToShareError,
  GetGetDAppToShareData,
  typeof QUERY_KEY.GET_DAPP_TO_SHARE
> {
  return {
    queryKey: QUERY_KEY.GET_DAPP_TO_SHARE,
    queryFn: async (): Promise<GetGetDAppToShareData> => {
      const data = await getDAppToShare()
      return data
    }
  }
}

export function useGetDAppToShare() {
  return useQuery(createGetDAppToShareQueryOptions())
}
