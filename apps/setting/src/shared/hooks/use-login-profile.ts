'use client'

import { loginProfile } from '@metanodejs/system-core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query/query-key'

export interface LoginProfileInput {
  id: number
  password: string
}
export function useLoginProfile() {
  const queryClient = useQueryClient()

  const mutation = useMutation<unknown, Error, LoginProfileInput>({
    mutationFn: ({ id, password }) => {
      return loginProfile({ id, password })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEY.GET_ALL_PROFILE }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEY.GET_CURRENT_PROFILE }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEY.GET_MY_SETTING })
      ])
    }
  })

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess
  }
}
