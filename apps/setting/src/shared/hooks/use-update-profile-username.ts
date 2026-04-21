'use client'
import { updateProfileUserName } from '@metanodejs/system-core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query/query-key'

interface UpdateProfileUserNameInput {
  id: number
  userName: string
}
export function useUpdateProfileUserName() {
  const queryClient = useQueryClient()

  const mutation = useMutation<unknown, Error, UpdateProfileUserNameInput>({
    mutationFn: (payload) => {
      return updateProfileUserName(payload)
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
    updateProfileUsername: mutation.mutate,
    updateProfileUsernameAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess
  }
}
