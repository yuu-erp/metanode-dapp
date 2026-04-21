import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * attempt, 3000),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false
    },
    mutations: {
      retry: 0
    }
  }
})
export const QUERY_KEY = {
  NEXTWORK: ['nextwork'],
  CONTRACT_INFO: ['contractInfo'],
  GET_ALL_WALLETS: ['getAllWallets'],
  ACTIVE_CODE: ['activeCode'],
  GET_SMART_CONTRACT_ADDRESS: (contractOwner: string) =>
    ['getSmartContractAddress', contractOwner] as const
}
