'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { QUERY_KEY } from '../lib/react-query'
import { getHiddenWallet } from '@metanodejs/system-core'
import { getOS } from '@/utils'
import { activeCodeContract } from '@/contract/active-code.contract'

export interface Payload {
  contractAddress?: string
  ip?: string
  isConnected?: boolean
}
export function createGetActiveCodeQueryOptions({
  contractAddress,
  ip,
  isConnected
}: Payload): UseQueryOptions<any, Error, any, typeof QUERY_KEY.ACTIVE_CODE> {
  return {
    queryKey: QUERY_KEY.ACTIVE_CODE,
    queryFn: async (): Promise<any> => {
      if (!contractAddress || !ip || !isConnected) return
      const { address } = await getHiddenWallet()
      console.log({ address })
      const userOS = getOS()
      const screenWidth = screen.width
      const screenHeight = screen.height
      const activeCode = await activeCodeContract.getActiveCodesByDeviceInfo(
        address,
        contractAddress,
        {
          _IP: ip,
          _screenSize: `${screenWidth}x${screenHeight}`,
          _os: userOS.os,
          _versionOs: userOS.versionOs
        }
      )

      return activeCode[activeCode.length - 1]
    },
    enabled: !!contractAddress && !!ip && !!isConnected
  }
}

export function useGetActiveCode(payload: Payload) {
  return useQuery(createGetActiveCodeQueryOptions(payload))
}
