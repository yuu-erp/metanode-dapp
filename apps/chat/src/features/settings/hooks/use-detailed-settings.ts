'use client'

import { container } from '@/container'
import { useCurrentAccount } from '@/shared/hooks'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export type DetailedSettingsData = {
  p2pChatEnabled: boolean
  reactionsEnabled: boolean
  showPreview: boolean
}
export type DetailedSettingsError = Error

export function createDetailedSettingsQueryOptions({
  address,
  contract
}: {
  address?: string
  contract?: string
}): UseQueryOptions<DetailedSettingsData, DetailedSettingsError, DetailedSettingsData> {
  return {
    queryKey: ['detailedSettings', address, contract],
    queryFn: async (): Promise<DetailedSettingsData> => {
      if (!address || !contract) throw new Error('Address not found!')
      const userContract = container.userContract
      const data = await userContract.getDetailedSettings({ from: address, to: contract })
      if (Array.isArray(data)) {
        return {
          p2pChatEnabled: data[0],
          reactionsEnabled: data[1],
          showPreview: data[2]
        }
      }
      return data
    },
    enabled: !!address
  }
}

export function useDetailedSettings() {
  const { data: account } = useCurrentAccount()
  return useQuery(
    createDetailedSettingsQueryOptions({
      address: account?.address,
      contract: account?.contractAddress
    })
  )
}
