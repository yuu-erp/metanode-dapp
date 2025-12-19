'use client'
import { profileRepository } from '@/repositories'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query/query-key'

interface UpdatePasswordProfileInput {
  id: number
  password: string
  passwordConfirm: string
}
export function useSetPasswordProfile() {
  const queryClient = useQueryClient()

  const mutation = useMutation<unknown, Error, UpdatePasswordProfileInput>({
    mutationFn: ({ id, password, passwordConfirm }) => {
      return profileRepository.updatePassword({ id, password, passwordConfirm })
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
    setPassword: mutation.mutate,
    setPasswordAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess
  }
}
