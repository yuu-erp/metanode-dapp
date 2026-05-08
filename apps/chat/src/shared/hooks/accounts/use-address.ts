import { useCurrentAccount } from '../use-current-account'

export function useAddress() {
  const { data: account } = useCurrentAccount()
  return {
    hiddenAddress: account?.hiddenAddress || '',
    address: account?.address || '',
    contractAddress: account?.contractAddress || ''
  }
}
