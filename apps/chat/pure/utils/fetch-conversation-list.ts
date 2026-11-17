import { container } from '@/container'
import type { GetFullInboxOutput } from '@/modules/blockchain/user-contract/types'
import { getHiddenWallet } from '@metanodejs/system-core'

/** Cùng contract call với `ConversationService.syncByAccount` (inbox on-chain). */
export async function fetchConversationListFromContract(options: {
  walletAddress: string
  userContractAddress: string
  offset?: number
  limit?: number
}): Promise<GetFullInboxOutput[]> {
  const { walletAddress, userContractAddress, offset = 0, limit = 100 } = options

  let from = walletAddress
  try {
    const hidden = await getHiddenWallet()
    if (hidden?.address) from = hidden.address
  } catch {
    // Pure test có thể không có hidden wallet / delegate — fallback ví chính.
  }

  return container.userContract.getFullInboxPaginatedOptimized({
    from,
    to: userContractAddress,
    inputData: { offset, limit },
  })
}

export function serializeForPureLog(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v)))
}
