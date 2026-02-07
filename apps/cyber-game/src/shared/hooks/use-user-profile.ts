import { useQuery } from '@tanstack/react-query'
import { UserService } from '../services/user-service'
import { queryKeys } from '../consts/query-keys'
import { ContractManager } from '../services/contracts'

export function createUserProfileQuery() {
  return {
    queryKey: queryKeys.user.profile,
    queryFn: async () => {
      const user = await UserService.getInstance().initialize()
      ContractManager.getInstance().setFromAddress(user.address)
      return user
    },
    staleTime: Infinity // User data shouldn't change often in this session
  }
}

export const useUserProfile = () => {
  return useQuery(createUserProfileQuery())
}
