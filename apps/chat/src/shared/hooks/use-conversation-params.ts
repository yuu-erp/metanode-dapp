import { useParams } from '@tanstack/react-router'
import { useAddress } from './accounts/use-address'
import { compareAddress } from '../lib'

export function useConversationParams() {
  const { type, id } = useParams({ strict: false })
  const { contractAddress } = useAddress()

  return {
    id: id ?? '',
    type: compareAddress(contractAddress, id ?? '') ? 'private' : (type ?? ('p2p' as any))
  }
}
