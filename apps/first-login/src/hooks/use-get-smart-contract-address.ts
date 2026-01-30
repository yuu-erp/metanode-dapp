'use client'

import { getSmartContractAddress } from '@metanodejs/system-core'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query'

export function createGetSmartContractAddressQueryOptions(
  contractOwner?: string
): UseQueryOptions<string, Error, string, ReturnType<typeof QUERY_KEY.GET_SMART_CONTRACT_ADDRESS>> {
  return {
    queryKey: QUERY_KEY.GET_SMART_CONTRACT_ADDRESS(contractOwner ?? ''),
    queryFn: async (): Promise<string> => {
      if (!contractOwner) throw new Error('Contract owner not found!')
      const contractAddress = await getSmartContractAddress(contractOwner)
      return contractAddress
    },
    enabled: !!contractOwner
  }
}

export function useGetSmartContractAddress(contractOwner?: string) {
  return useQuery(createGetSmartContractAddressQueryOptions(contractOwner))
}
