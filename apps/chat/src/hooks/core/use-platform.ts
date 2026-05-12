import { useQuery } from '@tanstack/react-query'
import { SHARED_QUERY_KEY } from '../../shared/lib/react-query'
import { getPlatform } from '@metanodejs/system-core'

export function usePlatform() {
  const { data, ...query } = useQuery({
    queryKey: SHARED_QUERY_KEY.PLATFORM,
    queryFn: async () => (await getPlatform()).platform,
    staleTime: Infinity
  })
  const isNotPc = !!data
  const isWindow = data === 'WINDOWS'

  return { ...query, data, isNotPc, isWindow }
}
