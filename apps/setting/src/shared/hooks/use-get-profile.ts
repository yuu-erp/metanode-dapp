'use client'

import type { Profile } from '@/interfaces'
import { profileRepository } from '@/repositories'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query/query-key'

export type GetCurrentProfilesData = Profile
export type GetCurrentProfilesError = Error

export function createGetCurrentProfileQueryOptions(): UseQueryOptions<
  GetCurrentProfilesData,
  GetCurrentProfilesError,
  GetCurrentProfilesData,
  typeof QUERY_KEY.GET_CURRENT_PROFILE
> {
  return {
    queryKey: QUERY_KEY.GET_CURRENT_PROFILE,
    queryFn: async (): Promise<GetCurrentProfilesData> => {
      const data = await profileRepository.getCurrentProfile()
      return data
    }
  }
}

/**
 * Custom hook sử dụng options từ hàm trên
 */
export function useGetCurrentProfile() {
  return useQuery(createGetCurrentProfileQueryOptions())
}
