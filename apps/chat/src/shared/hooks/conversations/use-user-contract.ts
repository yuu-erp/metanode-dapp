import { container } from '@/container'
import { ACCOUNT_QUERY_KEY } from '@/shared/lib/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const createUserContractQuery = (myAddress: string, address: string) =>
  queryOptions({
    queryKey: ACCOUNT_QUERY_KEY.CONTRACT_ADDRESS(address),
    queryFn: async () => {
      return await container.factoryContract.getUserContract({
        from: myAddress,
        inputData: {
          user: address
        }
      })
    }
  })

export function useUserContract(myAddress: string, address: string) {
  return useQuery(createUserContractQuery(myAddress, address))
}
