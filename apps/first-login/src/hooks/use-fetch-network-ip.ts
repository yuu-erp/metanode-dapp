'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query'

const urlNextworkIp = import.meta.env.VITE_URI_NEXTWORK_IP || 'https://api64.ipify.org?format=json'
export function createFetchNetworkIPQueryOptions(): UseQueryOptions<
  string,
  Error,
  string,
  typeof QUERY_KEY.NEXTWORK
> {
  return {
    queryKey: QUERY_KEY.NEXTWORK,
    queryFn: async (): Promise<string> => {
      const response = await fetch(urlNextworkIp)
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      const myNetwork = await response.json()
      return myNetwork.ip || 'Unknown'
    }
  }
}

export function useFetchNetworkIP() {
  return useQuery(createFetchNetworkIPQueryOptions())
}
