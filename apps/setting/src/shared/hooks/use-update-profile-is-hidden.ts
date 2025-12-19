'use client'
import { updateProfileIsHidden } from '@metanodejs/system-core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query/query-key'

interface UpdateProfileIsHiddenInput {
  id: number
  isHidden: boolean
}
export function useUpdateProfileIsHidden() {
  const queryClient = useQueryClient()

  const mutation = useMutation<unknown, Error, UpdateProfileIsHiddenInput>({
    mutationFn: (payload) => {
      return updateProfileIsHidden(payload)
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
    updateProfileIsHidden: mutation.mutate,
    updateProfileIsHiddenAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess
  }
}
