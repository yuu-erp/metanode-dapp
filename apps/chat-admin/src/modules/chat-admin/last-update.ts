import { methods } from '@/contract'
import { queryKeys } from '@/shared'
import { queryOptions } from '@tanstack/react-query'

export const createAdminExecutorAppointedAtQuery = (address: string) => {
  return queryOptions({
    queryKey: queryKeys.admin.adminExecutorAppointedAt(address),
    enabled: !!address,
    queryFn: async () => {
      const rs = await methods.factory.adminExecutorAppointedAt({
        '': address
      })
      return +rs * 1000
    }
  })
}

export const createUserDisabledAtQuery = (address: string) => {
  return queryOptions({
    queryKey: queryKeys.admin.userDisabledAt(address),
    enabled: !!address,
    queryFn: async () => {
      const rs = await methods.factory.userDisabledAt({
        '': address
      })
      return +rs * 1000
    }
  })
}

export const createUserRegisteredAtQuery = (address: string) => {
  return queryOptions({
    queryKey: queryKeys.admin.userRegisteredAt(address),
    enabled: !!address,
    queryFn: async () => {
      const rs = await methods.factory.userRegisteredAt({
        '': address
      })
      return +rs * 1000
    }
  })
}
