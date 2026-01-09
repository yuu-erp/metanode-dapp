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

export const SHARED_QUERY_KEY = {
  GET_ALL_WALLETS: ['getAllWallets'] as const,
  INIT_PRIVATE_FEATURE: ['initPrivateFeature'] as const
}

export const ACCOUNT_QUERY_KEY = {
  GET_CURRENT_ACCOUNT: ['getCurrentAccount'] as const,
  CHECK_USER_CONTRACT: (address: string) => ['checkUserContract', address] as const,
  LOAD_ACCOUNTS: ['loadAccounts'] as const
}

export const CONVERSATION_QUERY_KEY = {
  CONVERSATIONS: (accountId: string) => ['conversations', accountId] as const,
  CONVERSATION: (conversationId: string) => ['conversation', conversationId] as const
}

export const MESSAGE_QUERY_KEY = {
  MESSAGES: (accountId: string, conversationId: string) => ['messages', accountId, conversationId]
}
