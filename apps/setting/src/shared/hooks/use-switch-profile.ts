'use client'

import { switchAccount } from '@metanodejs/system-core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query/query-key'

export interface SwitchAccountInput {
  id: number
}
export function useSwitchProfile() {
  const queryClient = useQueryClient()

  const mutation = useMutation<unknown, Error, SwitchAccountInput>({
    mutationFn: ({ id }) => {
      return switchAccount(id)
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
    switchProfile: mutation.mutate,
    switchProfileAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess
  }
}
