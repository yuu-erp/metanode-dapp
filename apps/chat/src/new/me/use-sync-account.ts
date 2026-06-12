import { contractClient } from '@/clients'
import { useCurrentState } from '@/hooks/use-current-state'
import { useEffect } from 'react'

export function useSyncAccount() {
  const { account } = useCurrentState()

  useEffect(() => {
    if (!account?.hiddenAddress) return
    contractClient.setFrom(account.address)
  }, [account?.hiddenAddress])
}
