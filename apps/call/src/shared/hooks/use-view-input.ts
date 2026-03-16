import type { MeetingViewInput } from '@/modules/call/types'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import { queryClient, queryKeys } from '../react-query'

export function useViewInput() {
  const search: any = useSearch({ strict: false })

  const getBooleanValue = useCallback((v: string | boolean) => {
    if (typeof v === 'boolean') return v
    if (v.startsWith('true')) return true
    if (v.startsWith('false')) return false
    return false
  }, [])

  const { data } = useQuery({
    queryKey: queryKeys.viewInput,
    queryFn: (): MeetingViewInput => {
      return {
        caller: search?.caller ?? '',
        callee: search?.callee ?? '',
        address: search?.address ?? '',
        isMeet: getBooleanValue(search?.isMeet),
        isCaller: getBooleanValue(search?.isCaller),
        roomId: search?.roomId
      }
    }
  })

  const setViewInput = useCallback((v: Partial<MeetingViewInput>) => {
    queryClient.setQueryData(queryKeys.viewInput, (oldData: MeetingViewInput) => {
      if (!oldData) return oldData

      return {
        ...oldData,
        ...v
      }
    })
  }, [])
  console.log('thanhduy - useViewInput 2', data)

  return { data, setViewInput }
}
