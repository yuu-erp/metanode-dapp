import { queryKeys } from '@/shared'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const createGetUsersQuery = () =>
  queryOptions<User[]>({
    queryKey: queryKeys.admin.allUsers,
    queryFn: async () => {
      return Array.from({ length: 100 }, (_, i) => ({
        address: `${Date.now() + i} ${'0'.repeat(40)}`,
        lastUpdate: Date.now(),
        name: `name ${i}`,
        role: 'user',
        status: i ? 'active' : 'inActive'
      }))
    }
  })

export function useUsers() {
  return useQuery(createGetUsersQuery())
}
