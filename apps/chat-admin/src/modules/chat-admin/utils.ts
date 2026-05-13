import { methods } from '@/contract'
import { queryClient } from '@/shared'
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query'

export const createCustomInfiniteQuery = (key: any[], functionName: string) => {
  return infiniteQueryOptions({
    queryKey: key,
    initialPageParam: 1,
    retry: 0,
    queryFn: async ({ pageParam }) => {
      const fn = methods.factory[functionName as keyof typeof methods.factory] as any
      if (!fn) throw new Error(`Function ${functionName} not found`)

      const rs = await fn({
        page: pageParam,
        pageSize: 20
      })
      const totalPages = +rs.totalPages
      const total = +rs.total
      return { ...rs, hasNextPage: totalPages > pageParam, total, totalPages, page: pageParam }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasNextPage) {
        return undefined
      }

      return allPages.length + 1
    }
  })
}

export function useCustomInfiniteQuery(
  options: ReturnType<typeof createCustomInfiniteQuery>,
  dataKey: string
) {
  const query = useInfiniteQuery(options)

  return {
    ...query,
    flat:
      (query.data?.pages
        .map((item: any) => {
          console.log('item', item)
          const data = item[dataKey]
          if (!data)
            throw new Error(`Invalid data key: ${dataKey} for ${JSON.stringify(options.queryKey)}`)
          if (!Array.isArray(data))
            throw new Error(
              `Invalid type of data: ${dataKey} for ${JSON.stringify(options.queryKey)}`
            )
          return data
        })
        .flat() as string[]) ?? []
  }
}

type InfiniteQueryAddressMutation = 'add' | 'remove'

function setAddressInInfiniteQueryData(
  queryKey: any[],
  dataKey: string,
  address: string,
  mode: InfiniteQueryAddressMutation
) {
  const totalDelta = mode === 'add' ? 1 : -1
  return queryClient.setQueryData(queryKey, (old: any) => {
    if (!old?.pages) return old
    return {
      ...old,
      pages: old.pages.map((page: any, i: number) => {
        const list = page[dataKey]
        if (Array.isArray(list)) {
          let nextList = list
          if (mode === 'add' && i === 0) {
            nextList = [address, ...list]
          } else if (mode === 'remove' && list.includes(address)) {
            nextList = list.filter((item: string) => item !== address)
          }
          return {
            ...page,
            total: page.total + totalDelta,
            [dataKey]: nextList
          }
        }

        return page
      })
    }
  })
}

export function removeFromQueryData(queryKey: any[], dataKey: string, address: string) {
  return setAddressInInfiniteQueryData(queryKey, dataKey, address, 'remove')
}

export function addFromQueryData(queryKey: any[], dataKey: string, address: string) {
  return setAddressInInfiniteQueryData(queryKey, dataKey, address, 'add')
}
