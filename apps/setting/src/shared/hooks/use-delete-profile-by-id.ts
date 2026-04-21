'use client'
import { deleteProfileById } from '@metanodejs/system-core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query/query-key'

export function useDeleteProfileById() {
  const queryClient = useQueryClient()

  const mutation = useMutation<unknown, Error, number>({
    mutationFn: (id: number) => {
      return deleteProfileById(id)
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
    deleteProfileById: mutation.mutate,
    deleteProfileByIdAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess
  }
}
