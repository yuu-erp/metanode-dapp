'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query'

const urlContractInfo =
  import.meta.env.VITE_URI_CONTRACT_INFO || 'http://192.168.1.242:5500/contract-info.json'

export interface ContractInfo {
  port: number
  ip: string
  contractOwner: string
}

export function createFetchContractInfoQueryOptions(): UseQueryOptions<
  ContractInfo,
  Error,
  ContractInfo,
  typeof QUERY_KEY.CONTRACT_INFO
> {
  return {
    queryKey: QUERY_KEY.CONTRACT_INFO,
    queryFn: async (): Promise<ContractInfo> => {
      try {
        const response = await fetch(`${urlContractInfo}?v=${Date.now()}`)
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
        const contractInfo: ContractInfo = await response.json()
        return contractInfo
      } catch (error) {
        console.error(error)
        throw error
      }
    }
  }
}

export function useFetchContractInfo() {
  return useQuery(createFetchContractInfoQueryOptions())
}
