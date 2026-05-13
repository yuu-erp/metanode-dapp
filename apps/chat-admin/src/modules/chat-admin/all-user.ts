import { queryKeys } from '@/shared'

import { createCustomInfiniteQuery, useCustomInfiniteQuery } from './utils'

export const createAllUsersInfiniteQuery = () =>
  createCustomInfiniteQuery(queryKeys.admin.allUsers, 'getAllUsers')

export const useAllUsers = () => useCustomInfiniteQuery(createAllUsersInfiniteQuery(), 'usersData')
