'use client'
import { getMySetting } from '@metanodejs/system-core'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { QUERY_KEY } from '@/shared/lib/react-query/query-key'
import type { Profile } from '@/interfaces'

export type GetMySettingData = {
  'account-info': Profile
}
export type GetMySettingError = Error

export function createGetMySettingQueryOptions(): UseQueryOptions<
  GetMySettingData,
  GetMySettingError,
  GetMySettingData,
  typeof QUERY_KEY.GET_MY_SETTING
> {
  return {
    queryKey: QUERY_KEY.GET_MY_SETTING,
    queryFn: async (): Promise<GetMySettingData> => {
      const settings = await getMySetting<GetMySettingData>()
      return settings
    }
  }
}
export function useGetMySetting() {
  return useQuery(createGetMySettingQueryOptions())
}
