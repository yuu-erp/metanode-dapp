import { initPrivateFeature } from '@/bootstrap'
import { queryOptions } from '@tanstack/react-query'
import { SHARED_QUERY_KEY } from '../lib/react-query'

export const createInitPrivateFeatureQueryOptions = () =>
  queryOptions({
    queryKey: SHARED_QUERY_KEY.INIT_PRIVATE_FEATURE,
    queryFn: async () => {
      console.log('KHỞI TẠO PRIVATE FEATURE --------')
      await initPrivateFeature()
      return true
    },
    staleTime: Infinity, // chỉ init 1 lần
    gcTime: Infinity,
    retry: false
  })
