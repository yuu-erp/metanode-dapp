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
  PROFILE: (conversationId: string) => ['profile', conversationId] as const,
  key: (conversationId: string) => ['converstaionKey', conversationId] as const,
  pinned: (conversationId: string) => ['pinnedMessage', conversationId],
  list: ['conversationList'],
  detail: (conversationId: string) => ['conversationDetail', conversationId],
  inbox: (conversationId: string) => ['conversationInbox', conversationId]
}

export const MESSAGE_QUERY_KEY = {
  MESSAGES: (accountId: string, conversationId: string) => ['messages', accountId, conversationId],
  info: (messageId: string) => ['messaegInfo', messageId],
  list: (conversationId: string) => ['listMessage', conversationId]
}

export const FILE_CACHE_QUERY_KEY = {
  GET_FILE: (fileKey: string) => ['fileCache', fileKey] as const
}

export const CALL_QUERY_KEY = {
  PARTICIPANT: () => ['paripant'] as const,
  USER: (hiddenAddress: string) => ['participant-owner', hiddenAddress] as const
}

export const GROUP_QUERY_KEY = {
  ADMIN: (conversationId: string) => ['admin', conversationId] as const,
  alias: (conversationId: string) => ['grpupAlias', conversationId],
  memberList: (conversationId: string) => ['memberList', conversationId],
  name: (conversationId: string) => ['groupName', conversationId]
}

export const FILE_QUERY_KEY = {
  info: (fileId: string) => ['fileInfo', fileId] as const
}

export const USER_QUERY_KEY = {
  info: (contractAddress: string) => ['userInfo', contractAddress],
  contractAddress: (address: string) => ['contractAddress', address]
}

export const ACTIONS_QUERY_KEY = {
  sendMessage: ['sendMessage']
}

export const ME_QUERY_KEY = {
  identity: (conversationId: string) => ['identity', conversationId]
}
