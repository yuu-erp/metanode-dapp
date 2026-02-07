export const queryKeys = {
  agent: {
    contracts: (domain: string) => ['agent', 'contracts', domain] as const
  },
  user: {
    profile: ['user', 'profile'] as const
  }
} as const
