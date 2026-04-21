'use client'

import type { Profile } from '@/interfaces'
import { profileRepository } from '@/repositories'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query/query-key'

export type GetAllProfilesData = Profile[]
export type GetAllProfilesError = Error

export function createGetAllProfileQueryOptions(): UseQueryOptions<
  GetAllProfilesData,
  GetAllProfilesError,
  GetAllProfilesData,
  typeof QUERY_KEY.GET_ALL_PROFILE
> {
  return {
    queryKey: QUERY_KEY.GET_ALL_PROFILE,
    queryFn: async (): Promise<GetAllProfilesData> => {
      const data = await profileRepository.getAllProfile()
      return data
    }
  }
}

export function useGetAllProfile() {
  return useQuery(createGetAllProfileQueryOptions())
}
