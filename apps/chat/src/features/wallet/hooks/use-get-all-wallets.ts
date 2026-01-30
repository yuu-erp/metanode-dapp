'use client'

import { container } from '@/container'
import type { Wallet } from '@/modules/wallet'
import { SHARED_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export const mockWallets: any[] = [
  {
    backgroundImage: 'https://i.pinimg.com/736x/13/6f/72/136f72c36a9830f51d80cd1cf5b32501.jpg',
    name: 'Main Wallet',
    address: '0xA1b2c3D4e5F678901234567890abcdefABCDEF',
    totalBalanceString: '1250000000000000000', // 1.25
    decimals: 18
  },
  {
    backgroundImage: 'https://i.pinimg.com/736x/b8/bc/f8/b8bcf85f98b33d50470f47d0cc025346.jpg',
    name: 'Savings Wallet',
    address: '0xB2c3D4e5F678901234567890abcdefABCDEF1',
    totalBalanceString: '50000000000000000000', // 50
    decimals: 18
  },
  {
    backgroundImage: 'https://i.pinimg.com/1200x/d8/57/2a/d8572af31e79e536c3c84c228721470a.jpg',
    name: 'Trading Wallet',
    address: '0xC3D4e5F678901234567890abcdefABCDEF12',
    totalBalanceString: '987654321', // 987.654321 (ví dụ token 6 decimals)
    decimals: 6
  },
  {
    backgroundImage: 'https://i.pinimg.com/1200x/10/f5/11/10f5112a382644ffc057591f4f20220d.jpg',
    name: 'Test Wallet',
    address: '0xD4e5F678901234567890abcdefABCDEF123',
    totalBalanceString: '0',
    decimals: 18
  }
]

export function createGetAllWalletsQueryOptions(): UseQueryOptions<
  Wallet[],
  Error,
  Wallet[],
  typeof SHARED_QUERY_KEY.GET_ALL_WALLETS
> {
  return {
    queryKey: SHARED_QUERY_KEY.GET_ALL_WALLETS,
    queryFn: async (): Promise<Wallet[]> => {
      // return mockWallets
      const walletService = container.walletService
      return await walletService.getAllWallets()
    }
  }
}

export function useGetAllWallets() {
  return useQuery(createGetAllWalletsQueryOptions())
}
