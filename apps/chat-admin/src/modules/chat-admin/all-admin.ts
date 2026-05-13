import { queryKeys } from '@/shared'

import { createCustomInfiniteQuery, useCustomInfiniteQuery } from './utils'

export const createAllAdminInfiniteQuery = () =>
  createCustomInfiniteQuery(queryKeys.admin.allAdmin, 'getAllAdminExecutors')

export const useAllAdmin = () => useCustomInfiniteQuery(createAllAdminInfiniteQuery(), 'executors')
