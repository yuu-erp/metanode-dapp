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
  INIT_PRIVATE_FEATURE: ['initPrivateFeature'] as const,
  PLATFORM: ['platform'] as const,
  HIDDEN_ADDRESS: ['hiddenWallet'] as const
}

export const ACCOUNT_QUERY_KEY = {
  GET_CURRENT_ACCOUNT: ['getCurrentAccount'] as const,
  CHECK_USER_CONTRACT: (address: string) => ['checkUserContract', address] as const,
  LOAD_ACCOUNTS: ['loadAccounts'] as const,
  USER_PROFILE: (conversationId: string) => ['userProfile', conversationId],
  CONTRACT_ADDRESS: (address: string) => ['contractAddress', address],
  USER_BY_ADDRESS: (address: string) => ['userByAddress', address],
  PROFILE_BY_ADDRESS: (address: string) => ['userByAddress', address]
}

export const CONVERSATION_QUERY_KEY = {
  CONVERSATIONS: (accountId: string) => ['conversations', accountId] as const,
  CONVERSATION: (conversationId: string) => ['conversation', conversationId] as const,
  GROUP_MEMBERS: (conversationId: string) => ['groupMembers', conversationId] as const,
  PROFILE: (conversationId: string) => ['profile', conversationId] as const
}

export const MESSAGE_QUERY_KEY = {
  MESSAGES: (accountId: string, conversationId: string) => ['messages', accountId, conversationId]
}

export const FILE_CACHE_QUERY_KEY = {
  GET_FILE: (fileKey: string) => ['fileCache', fileKey] as const
}

export const CALL_QUERY_KEY = {
  PARTICIPANT: () => ['paripant'] as const,
  USER: (hiddenAddress: string) => ['participant-owner', hiddenAddress] as const
}
