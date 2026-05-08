import { useEffect } from 'react'
import { useCurrentAccount } from '../use-current-account'
import { CONTRACT_ADDRESSES } from '@/config'
import { chatContracts } from '@/container'

export function useSyncContractsAddressess() {
  const { data } = useCurrentAccount()

  useEffect(() => {
    if (!data?.address) return
    chatContracts.setFrom(data.address)
  }, [data?.address])

  useEffect(() => {
    chatContracts.setTo({ factory: CONTRACT_ADDRESSES.factory })
  }, [])
}
